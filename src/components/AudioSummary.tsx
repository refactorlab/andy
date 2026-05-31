import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { AUDIO_DURATION, WAVEFORM_BARS, formatTimecode, pickMaleVoice, playedBars, waveform } from '../lib/audio'

// Computed once at module load — pure + 3-decimal-rounded, so the Bun SSR pass
// and the browser hydration emit identical inline styles (see lib/audio.ts).
const BARS = waveform(WAVEFORM_BARS)

// The narration text. It IS the accessible content (real DOM text, good for
// screen readers + SEO) and the script the browser's speech synthesis reads
// aloud when available. Written to land near AUDIO_DURATION at a normal rate.
const TRANSCRIPT =
  "Here's the thirty-second handoff for pull request thirty-six. This change " +
  'refactors the static profiler’s frame-preference logic across about a ' +
  'hundred files. The headline: it fixes a correctness bug where a PageRank of ' +
  'zero — a valid value for isolated nodes — was treated as unset, ' +
  'silently shipping wrong output. Net impact is positive on all four axes: ' +
  'money down about eighteen hundred dollars a month, customer value up, and the ' +
  'scan artifact shrinks from nine-point-eight to under four megabytes. Three ' +
  'risks are worth a look before merge; the rest are advisory. Start your review ' +
  'in compact dot rs and the f64 intrinsics — that’s where the behavior ' +
  'actually changed. Everything else is mechanical.'

// Short line used to audition a voice / playback settings without playing the
// whole narration.
const SAMPLE = 'This is the voice your reviewers will hear on every pull request.'

// Trim OS suffixes ("Desktop"/"Online") and locale parentheses for a tidy label.
const shortVoiceName = (name: string) =>
  name.replace(/\s*(?:Desktop|Online)\b.*/i, '').replace(/\s*\(.*\)\s*/g, '').trim()

const PlayIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.5-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" />
  </svg>
)
const PauseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6.5" y="5" width="4" height="14" rx="1.4" />
    <rect x="13.5" y="5" width="4" height="14" rx="1.4" />
  </svg>
)

/**
 * "Audio summary in the comment" — a faithful, accessible preview of Andy's
 * narrated PR overview, framed as an embed inside the bot's comment.
 *
 * The player always works visually (animated waveform, ticking timecode,
 * seekable progress, full transcript). When the browser exposes Speech
 * Synthesis it ALSO reads the transcript aloud — progressive enhancement, with
 * a mute toggle. All browser APIs are touched only inside effects/handlers, so
 * the SSR prerender stays clean and hydration matches.
 */
export function AudioSummary() {
  const [playing, setPlaying] = useState(false)
  const [seconds, setSeconds] = useState(0) // integer, throttled — drives the timecode + fill
  const [hasVoice, setHasVoice] = useState(false)
  const [muted, setMuted] = useState(false)
  const [voiceLabel, setVoiceLabel] = useState<string | null>(null)

  // Web Speech utterance settings, exposed as controls. Ranges per the spec:
  // rate 0.1–10, pitch 0–2, volume 0–1 (all default 1).
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceURI, setVoiceURI] = useState('') // '' = browser default
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(1)

  // rAF bookkeeping lives in refs so the loop effect depends only on `playing`,
  // and so the event handlers below can stay stable while still reading the
  // latest play/mute/utterance state.
  const elapsedRef = useRef(0)
  const baseRef = useRef(0)
  const mutedRef = useRef(false)
  const playingRef = useRef(false)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const rateRef = useRef(1)
  const pitchRef = useRef(1)
  const volumeRef = useRef(1)
  mutedRef.current = muted
  playingRef.current = playing
  rateRef.current = rate
  pitchRef.current = pitch
  volumeRef.current = volume

  // Detect speech support + pick the best male English voice, after hydration
  // (never during SSR render). getVoices() is populated asynchronously in some
  // browsers, so we also re-pick on the `voiceschanged` event.
  useEffect(() => {
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined
    if (!synth) return
    setHasVoice(true)
    const loadVoices = () => {
      const list = synth.getVoices()
      if (!list.length) return
      setVoices(list)
      // Auto-select the best male voice once, unless the user has already picked.
      if (!voiceRef.current) {
        const v = pickMaleVoice(list)
        if (v) {
          voiceRef.current = v
          setVoiceURI(v.voiceURI)
          setVoiceLabel(shortVoiceName(v.name))
        }
      }
    }
    loadVoices()
    synth.addEventListener?.('voiceschanged', loadVoices)
    return () => synth.removeEventListener?.('voiceschanged', loadVoices)
  }, [])

  const stopSpeech = useCallback(() => {
    try {
      window.speechSynthesis?.cancel()
    } catch {
      /* speech is best-effort */
    }
  }, [])

  // Build + speak an utterance with the CURRENT voice/rate/pitch/volume (read
  // from refs so this stays stable). Speaks unconditionally — callers decide
  // whether the mute state allows it (gating here would read a stale `mutedRef`
  // when called from the setMuted updater, so unmute-while-playing wouldn't
  // resume).
  const speakText = useCallback((text: string) => {
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined
    if (!synth) return
    try {
      synth.cancel() // a queued/!ended utterance would otherwise delay this one
      const u = new SpeechSynthesisUtterance(text)
      if (voiceRef.current) u.voice = voiceRef.current
      // Match lang to the chosen voice (e.g. Daniel is en-GB) so engines don't
      // substitute a different default.
      u.lang = voiceRef.current?.lang ?? 'en-US'
      u.rate = rateRef.current
      u.pitch = pitchRef.current
      u.volume = volumeRef.current
      synth.speak(u)
    } catch {
      /* some browsers throw if no voice is installed — ignore */
    }
  }, [])

  const speak = useCallback(() => speakText(TRANSCRIPT), [speakText])
  const previewVoice = useCallback(() => speakText(SAMPLE), [speakText])

  // Switch speaker. Updates the active voice + label; if a real narration is
  // already playing (and not muted) we restart it in the new voice so the swap
  // is audible immediately — otherwise the user auditions it via Preview / Play.
  const onVoiceChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const uri = e.target.value
      const v = voices.find((x) => x.voiceURI === uri) ?? null
      voiceRef.current = v
      setVoiceURI(uri)
      setVoiceLabel(v ? shortVoiceName(v.name) : null)
      if (playingRef.current && !mutedRef.current) speak()
    },
    [voices, speak],
  )

  // Single source of truth for "where are we": writes the ref + throttles the
  // React state to whole-second changes so we re-render ~once a second, not
  // ~60×. The discrete waveform fill (one bar ≈ one second) matches naturally.
  const setElapsed = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(AUDIO_DURATION, value))
    elapsedRef.current = clamped
    const whole = Math.floor(clamped)
    setSeconds((prev) => (prev === whole ? prev : whole))
  }, [])

  // The play loop. Re-armed whenever `playing` flips true; cancelled on pause,
  // completion, or unmount.
  useEffect(() => {
    if (!playing) return
    baseRef.current = performance.now() - elapsedRef.current * 1000
    let raf = 0
    const tick = (now: number) => {
      const e = (now - baseRef.current) / 1000
      if (e >= AUDIO_DURATION) {
        setElapsed(AUDIO_DURATION)
        setPlaying(false)
        stopSpeech()
        return
      }
      setElapsed(e)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, setElapsed, stopSpeech])

  // Always cut narration if the component leaves the tree mid-play.
  useEffect(() => stopSpeech, [stopSpeech])

  const start = useCallback(() => {
    if (elapsedRef.current >= AUDIO_DURATION) setElapsed(0) // replay from the top
    setPlaying(true)
    if (!mutedRef.current) speak()
  }, [setElapsed, speak])

  const pause = useCallback(() => {
    setPlaying(false)
    stopSpeech()
  }, [stopSpeech])

  const toggle = useCallback(() => {
    if (playing) pause()
    else start()
  }, [playing, pause, start])

  // Let the command palette ("Play the audio summary") drive playback.
  useEffect(() => {
    const onPlay = () => start()
    window.addEventListener('play-audio-summary', onPlay)
    return () => window.removeEventListener('play-audio-summary', onPlay)
  }, [start])

  const seekTo = useCallback(
    (fraction: number) => {
      const target = Math.max(0, Math.min(1, fraction)) * AUDIO_DURATION
      setElapsed(target)
      if (playingRef.current) baseRef.current = performance.now() - target * 1000 // resync the running loop
    },
    [setElapsed],
  )

  const onWavePointer = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    seekTo((e.clientX - r.left) / r.width)
  }

  // Standard ARIA slider keys only (arrows / Home / End). Play-pause is the
  // play button's job — keeping Space/Enter off the slider matches the APG
  // pattern and avoids hijacking Space (page scroll) from keyboard users.
  const onWaveKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const cur = elapsedRef.current
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      seekTo((cur + 5) / AUDIO_DURATION)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      seekTo((cur - 5) / AUDIO_DURATION)
    } else if (e.key === 'Home') {
      e.preventDefault()
      seekTo(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      seekTo(1)
    }
  }

  const played = playedBars(seconds)
  const timecode = formatTimecode(seconds)
  const total = formatTimecode(AUDIO_DURATION)

  // Group voices by language for the <select>, English locales first.
  const voiceGroups = useMemo(() => {
    const byLang = new Map<string, SpeechSynthesisVoice[]>()
    for (const v of voices) {
      const key = v.lang || 'other'
      const arr = byLang.get(key)
      if (arr) arr.push(v)
      else byLang.set(key, [v])
    }
    return [...byLang.entries()]
      .map(([lang, vs]) => [lang, vs.slice().sort((a, b) => a.name.localeCompare(b.name))] as const)
      .sort((a, b) => {
        const ae = /^en/i.test(a[0]) ? 0 : 1
        const be = /^en/i.test(b[0]) ? 0 : 1
        return ae - be || a[0].localeCompare(b[0])
      })
  }, [voices])

  return (
    <section className="section section-audio" id="audio">
      <div className="wrap">
        <header className="section-head" data-reveal>
          <span className="kicker">// new · the PR, read aloud</span>
          <h2>
            And a <span className="hl">60-second audio summary</span>, right in the comment.
          </h2>
          <p className="section-lede">
            Andy now narrates every review. Press play on the comment and hear what changed, why it
            matters, and where to look first — for the commute, the code walk, or the reviewer
            who'd rather listen than scroll a hundred-file diff.
          </p>
        </header>

        <div className="audio-embed" data-reveal>
          <header className="audio-head">
            <span className="audio-avatar" aria-hidden="true">
              A
            </span>
            <div className="audio-head-meta">
              <div className="audio-head-name">
                <strong>andy-bot</strong>
                <span className="audio-tag">🔊 audio summary</span>
              </div>
              <div className="audio-head-sub">#36 · refactorlab/drift · narrated overview · {total}</div>
            </div>
          </header>

          <div className={`audio-player${playing ? ' is-playing' : ''}`}>
            <button
              type="button"
              className="audio-play"
              onClick={toggle}
              aria-pressed={playing}
              aria-label={playing ? 'Pause audio summary' : 'Play audio summary'}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>

            <div className="audio-main">
              <div
                className="audio-wave"
                role="slider"
                tabIndex={0}
                aria-label="Seek audio summary"
                aria-valuemin={0}
                aria-valuemax={AUDIO_DURATION}
                aria-valuenow={seconds}
                aria-valuetext={`${timecode} of ${total}`}
                onClick={onWavePointer}
                onKeyDown={onWaveKey}
              >
                {BARS.map((h, i) => (
                  <span
                    key={i}
                    className={`audio-bar${i < played ? ' is-played' : ''}${
                      playing && i === played ? ' is-head' : ''
                    }`}
                    style={{ '--h': h, '--i': i } as CSSProperties}
                    aria-hidden="true"
                  />
                ))}
              </div>

              <div className="audio-meta">
                <span className="audio-time">
                  {timecode} <span className="audio-time-total">/ {total}</span>
                </span>
                <span className={`audio-status${playing ? ' is-live' : ''}`}>
                  {playing ? (
                    <>
                      <span className="audio-status-dot" aria-hidden="true" /> narrating
                    </>
                  ) : (
                    voiceLabel ?? 'AI voice · en-US'
                  )}
                </span>
              </div>
            </div>

            {hasVoice ? (
              <button
                type="button"
                className={`audio-mute${muted ? ' is-muted' : ''}`}
                onClick={() => {
                  setMuted((m) => {
                    const next = !m
                    if (next) stopSpeech()
                    else if (playing) speak()
                    return next
                  })
                }}
                aria-pressed={muted}
                aria-label={muted ? 'Unmute narration' : 'Mute narration'}
                title={muted ? 'Unmute narration' : 'Mute narration'}
              >
                {muted ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M11 5 6 9H3v6h3l5 4z" />
                    <path d="m23 9-6 6" />
                    <path d="m17 9 6 6" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M11 5 6 9H3v6h3l5 4z" />
                    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                    <path d="M19 5a9 9 0 0 1 0 14" />
                  </svg>
                )}
              </button>
            ) : null}
          </div>

          {hasVoice ? (
            <details className="audio-settings">
              <summary>
                <span>Voice &amp; playback</span>
                <span className="audio-transcript-chevron" aria-hidden="true">
                  +
                </span>
              </summary>
              <div className="audio-settings-body">
                <div className="audio-field">
                  <label className="audio-field-head" htmlFor="audio-voice">
                    <span className="audio-field-name">Speaker</span>
                  </label>
                  <select id="audio-voice" className="audio-select" value={voiceURI} onChange={onVoiceChange}>
                    <option value="">Auto (browser default)</option>
                    {voiceGroups.map(([lang, vs]) => (
                      <optgroup key={lang} label={lang}>
                        {vs.map((v, i) => (
                          <option key={`${v.voiceURI}-${i}`} value={v.voiceURI}>
                            {v.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="audio-field">
                  <label className="audio-field-head" htmlFor="audio-rate">
                    <span className="audio-field-name">Rate</span>
                    <span className="audio-field-val">{rate.toFixed(2)}×</span>
                  </label>
                  <input
                    id="audio-rate"
                    className="audio-range"
                    type="range"
                    min={0.5}
                    max={2}
                    step={0.05}
                    value={rate}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      rateRef.current = v
                      setRate(v)
                    }}
                  />
                </div>

                <div className="audio-field">
                  <label className="audio-field-head" htmlFor="audio-pitch">
                    <span className="audio-field-name">Pitch</span>
                    <span className="audio-field-val">{pitch.toFixed(2)}</span>
                  </label>
                  <input
                    id="audio-pitch"
                    className="audio-range"
                    type="range"
                    min={0}
                    max={2}
                    step={0.05}
                    value={pitch}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      pitchRef.current = v
                      setPitch(v)
                    }}
                  />
                </div>

                <div className="audio-field">
                  <label className="audio-field-head" htmlFor="audio-volume">
                    <span className="audio-field-name">Volume</span>
                    <span className="audio-field-val">{Math.round(volume * 100)}%</span>
                  </label>
                  <input
                    id="audio-volume"
                    className="audio-range"
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      volumeRef.current = v
                      setVolume(v)
                    }}
                  />
                </div>

                <div className="audio-settings-foot">
                  <button type="button" className="audio-preview" onClick={previewVoice}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.5-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" />
                    </svg>
                    Preview voice
                  </button>
                  <span className="audio-settings-hint">Web Speech API · your device's voices</span>
                </div>
              </div>
            </details>
          ) : null}

          <details className="audio-transcript">
            <summary>
              <span>Read the transcript</span>
              <span className="audio-transcript-chevron" aria-hidden="true">
                +
              </span>
            </summary>
            <p>{TRANSCRIPT}</p>
          </details>
        </div>
      </div>
    </section>
  )
}
