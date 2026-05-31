/**
 * Small before→after architecture sketch that fills the featured "Architecture
 * map" bento cell (it spans 2 rows, so its text leaves a tall gap below). The
 * sketch literally illustrates the card's promise — "before → after diagrams of
 * what your PR changed" — with a generic, clearly-illustrative example: a cache
 * layer inserted between auth and db. Static SVG, no JS, no animation; shown
 * only in the wide featured layout (hidden when the card collapses on mobile).
 */
export function FeaturedDiagram() {
  return (
    <div className="artifact-preview" aria-hidden="true">
      {/* Decorative: the card's heading + body convey the meaning, and the
          wrapping .artifact-preview is aria-hidden — so the SVG carries no
          role/label (which would be dead under an aria-hidden ancestor). */}
      <svg className="ap-svg" viewBox="0 0 560 220">
        <defs>
          <marker id="ap-arrowhead" markerWidth="9" markerHeight="9" refX="6.5" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" className="ap-arrowfill" />
          </marker>
        </defs>

        {/* before — auth → db, direct */}
        <text x="6" y="12" className="ap-cap">before</text>
        <path className="ap-edge" d="M66,68 L66,162" />
        <rect x="6" y="30" width="120" height="38" rx="10" className="ap-box" />
        <text x="66" y="49" className="ap-text" textAnchor="middle">auth.ts</text>
        <rect x="6" y="162" width="120" height="38" rx="10" className="ap-box" />
        <text x="66" y="181" className="ap-text" textAnchor="middle">db.ts</text>

        {/* transform */}
        <path className="ap-arrow" d="M152,115 L300,115" markerEnd="url(#ap-arrowhead)" />

        {/* after — auth → cache(new) → db */}
        <text x="330" y="12" className="ap-cap">after</text>
        <path className="ap-edge" d="M390,68 C390,86 408,96 426,96" />
        <path className="ap-edge" d="M426,134 C426,152 408,162 390,162" />
        <rect x="330" y="30" width="120" height="38" rx="10" className="ap-box" />
        <text x="390" y="49" className="ap-text" textAnchor="middle">auth.ts</text>
        <rect x="356" y="96" width="140" height="38" rx="10" className="ap-box ap-box-new" />
        <text x="426" y="115" className="ap-text ap-text-new" textAnchor="middle">cache.ts</text>
        <rect x="330" y="162" width="120" height="38" rx="10" className="ap-box" />
        <text x="390" y="181" className="ap-text" textAnchor="middle">db.ts</text>
      </svg>
    </div>
  )
}
