import { useEffect, useRef } from 'react'

/**
 * Flowing animated gradient rendered by a hand-written WebGL2 fragment shader
 * (domain-warped fractal Brownian motion in the brand palette). No deps.
 *
 *  - Renders at ~0.6× device resolution — it's a soft backdrop, so low-res is
 *    cheaper and reads as natural blur.
 *  - Colour uniforms are pulled from the live CSS theme tokens and refreshed
 *    when `data-theme` flips.
 *  - Loop pauses while the tab is hidden; reduced motion draws one static frame.
 *  - If WebGL2 / shader compilation fails, it bails silently and the CSS
 *    `.aurora` fallback stays visible (we only hide it on success).
 */
const VERT = `#version 300 es
void main() {
  vec2 v[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
  gl_Position = vec4(v[gl_VertexID], 0.0, 1.0);
}`

const FRAG = `#version 300 es
precision highp float;
out vec4 frag;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform vec3 uBg, uA, uB, uC;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1, 0));
  float c = hash(i + vec2(0, 1)), d = hash(i + vec2(1, 1));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}
void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  vec2 p = uv * vec2(uRes.x / uRes.y, 1.0);
  float t = uTime * 0.028;

  vec2 q = vec2(fbm(p * 2.0 + t), fbm(p * 2.0 - t + 5.0));
  vec2 r = vec2(fbm(p * 2.0 + q * 1.6 + t * 1.2), fbm(p * 2.0 + q * 1.6 - t));
  float f = fbm(p * 2.0 + r * 2.0);

  float md = distance(uv, uMouse);
  f += smoothstep(0.45, 0.0, md) * 0.07;

  // Calm wash: keep mostly background with soft accent wisps.
  vec3 col = uBg;
  col = mix(col, uA, smoothstep(0.20, 0.92, f) * 0.32);
  col = mix(col, uB, smoothstep(0.45, 1.00, r.x) * 0.22);
  col = mix(col, uC, smoothstep(0.60, 1.00, q.y) * 0.14);

  float vig = smoothstep(1.15, 0.30, length(uv - 0.5));
  col = mix(uBg, col, vig * 0.9 + 0.1);

  frag = vec4(col, 1.0);
}`

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '').trim()
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  if (full.length !== 6) return [0, 0, 0]
  const n = parseInt(full, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: false,
      powerPreference: 'low-power',
    })
    if (!gl) return // → CSS aurora fallback stays

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    const program = gl.createProgram()
    if (!vs || !fs || !program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    const u = {
      res: gl.getUniformLocation(program, 'uRes'),
      time: gl.getUniformLocation(program, 'uTime'),
      mouse: gl.getUniformLocation(program, 'uMouse'),
      bg: gl.getUniformLocation(program, 'uBg'),
      a: gl.getUniformLocation(program, 'uA'),
      b: gl.getUniformLocation(program, 'uB'),
      c: gl.getUniformLocation(program, 'uC'),
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scale = Math.min(window.devicePixelRatio || 1, 2) * 0.6
    const mouse = { x: 0.5, y: 0.5 }
    let raf = 0
    let running = false
    const startTime = performance.now()

    function readColors() {
      const cs = getComputedStyle(document.documentElement)
      const get = (name: string) => cs.getPropertyValue(name)
      gl!.uniform3fv(u.bg, hexToRgb(get('--bg')))
      gl!.uniform3fv(u.a, hexToRgb(get('--accent')))
      gl!.uniform3fv(u.b, hexToRgb(get('--accent-2')))
      gl!.uniform3fv(u.c, hexToRgb(get('--info')))
    }

    function resize() {
      const w = Math.max(1, Math.round(window.innerWidth * scale))
      const h = Math.max(1, Math.round(window.innerHeight * scale))
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w
        canvas!.height = h
        gl!.viewport(0, 0, w, h)
      }
      gl!.uniform2f(u.res, w, h)
    }

    function render(now: number) {
      gl!.uniform1f(u.time, (now - startTime) / 1000)
      gl!.uniform2f(u.mouse, mouse.x, mouse.y)
      gl!.drawArrays(gl!.TRIANGLES, 0, 3)
      if (running) raf = requestAnimationFrame(render)
    }

    function start() {
      if (running || reduceMotion) return
      running = true
      raf = requestAnimationFrame(render)
    }
    function stop() {
      running = false
      cancelAnimationFrame(raf)
    }

    const onPointerMove = (e: PointerEvent) => {
      mouse.x = e.clientX / window.innerWidth
      mouse.y = 1 - e.clientY / window.innerHeight
    }
    const onVisibility = () => (document.hidden ? stop() : start())
    const onResize = () => {
      resize()
      if (!running) render(performance.now())
    }
    const themeObserver = new MutationObserver(() => {
      readColors()
      if (!running) render(performance.now())
    })

    readColors()
    resize()
    render(performance.now()) // first frame immediately (no black flash)
    document.documentElement.classList.add('has-shader')

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    start()

    return () => {
      stop()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      themeObserver.disconnect()
      document.documentElement.classList.remove('has-shader')
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.bindVertexArray(null)
      gl.deleteVertexArray(vao)
    }
  }, [])

  return <canvas ref={canvasRef} className="shader-bg" aria-hidden="true" />
}
