import { chordTab, diagramLayout, voicingFor } from '../audio/chords'

/** Chord box (strings vertical, low E on the left) plus the same shape as tab. */
export function ChordDiagram({ name, capo = 0 }: { name: string; capo?: number }) {
  const v = voicingFor(name)
  if (!v) return null
  const { base, barre } = diagramLayout(v)
  const sx = (i: number) => 20 + i * 12 // string x (room on the left for the fret number)
  const fy = (n: number) => 16 + n * 14 // fret line y (0 = nut / top line)
  const dotY = (f: number) => fy(f - base) + 7
  return (
    <div className="flex items-center gap-3">
      <div className="text-center">
        <div className="font-display text-2xl text-accent leading-none mb-1">{name}</div>
        <svg viewBox="0 0 90 92" className="w-[108px] h-auto" role="img" aria-label={`${name} chord shape`}>
          {/* nut or starting fret */}
          {base === 1 ? <rect x="19" y="14" width="62" height="3" rx="1" fill="var(--ink)" /> : <text x="0" y={fy(0) + 10} fontSize="9" fill="var(--muted)">{base}fr</text>}
          {[0, 1, 2, 3, 4].map((n) => (
            <line key={n} x1="20" x2="80" y1={fy(n)} y2={fy(n)} stroke="var(--muted)" strokeWidth=".8" opacity=".7" />
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1={sx(i)} x2={sx(i)} y1={fy(0)} y2={fy(4)} stroke="var(--ink)" strokeWidth={1.4 - i * 0.12} opacity=".85" />
          ))}
          {/* open / muted markers */}
          {v.map((f, i) =>
            f === null ? (
              <text key={i} x={sx(i)} y="10" fontSize="9" textAnchor="middle" fill="var(--muted)">
                ✕
              </text>
            ) : f === 0 ? (
              <circle key={i} cx={sx(i)} cy="7" r="3" fill="none" stroke="var(--ink)" strokeWidth="1.1" />
            ) : null,
          )}
          {barre && <rect x={sx(barre.from) - 4.5} y={dotY(barre.fret) - 4.5} width={sx(barre.to) - sx(barre.from) + 9} height="9" rx="4.5" fill="var(--accent)" />}
          {v.map((f, i) => (f && f > 0 && !(barre && f === barre.fret && i >= barre.from) ? <circle key={i} cx={sx(i)} cy={dotY(f)} r="4.6" fill="var(--accent)" /> : null))}
        </svg>
        {capo > 0 && <div className="text-[10px] text-muted">capo {capo}</div>}
      </div>
      <pre className="font-mono text-[13px] leading-[1.25] text-ink bg-bg/60 border border-line rounded-lg px-2.5 py-1.5" aria-label={`${name} as tab`}>
        {chordTab(v).join('\n')}
      </pre>
    </div>
  )
}
