import { useState } from 'react'
import { cx } from './ui'

export interface Bar {
  key: string
  label: string // short axis label
  value: number
  detail: string // readout when selected
}

/**
 * Single-series bar chart (no legend: the title names the series). Tap/hover a
 * bar to read its value; an optional dashed reference line marks a target.
 */
export function BarChart({ bars, target, targetLabel, unit, highlightKey }: { bars: Bar[]; target?: number; targetLabel?: string; unit: string; highlightKey?: string }) {
  const [sel, setSel] = useState<string | null>(null)
  const max = Math.max(1, target ?? 0, ...bars.map((b) => b.value))
  const shown = bars.find((b) => b.key === sel) ?? bars.find((b) => b.key === highlightKey) ?? bars.at(-1)
  return (
    <div>
      <div className="h-5 text-sm tabular" aria-live="polite">
        {shown && (
          <>
            <b>{shown.detail}</b>
          </>
        )}
      </div>
      <div className="relative mt-2 h-32 flex items-end gap-[2px]" role="list" onMouseLeave={() => setSel(null)}>
        {target !== undefined && (
          <div className="absolute inset-x-0 border-t border-dashed border-muted/60 pointer-events-none" style={{ bottom: `${(target / max) * 100}%` }}>
            <span className="absolute right-0 -top-4 text-[10px] text-muted">{targetLabel}</span>
          </div>
        )}
        {bars.map((b) => (
          <button
            key={b.key}
            role="listitem"
            aria-label={`${b.label}: ${b.value} ${unit}`}
            onClick={() => setSel(b.key)}
            onMouseEnter={() => setSel(b.key)}
            className="flex-1 h-full flex items-end justify-center"
          >
            <span
              className={cx('w-full max-w-5 rounded-t-[4px]', (sel ?? highlightKey) === b.key ? 'bg-accent' : 'bg-accent/55')}
              style={{ height: b.value ? `max(3px, ${(b.value / max) * 100}%)` : '0' }}
            />
          </button>
        ))}
      </div>
      <div className="flex gap-[2px] border-t border-line pt-1">
        {bars.map((b) => (
          <span key={b.key} className="flex-1 text-center text-[10px] text-muted tracking-tighter">
            {b.label}
          </span>
        ))}
      </div>
      <details className="mt-2 text-xs text-muted">
        <summary className="cursor-pointer">Table view</summary>
        <table className="w-full mt-1 tabular">
          <tbody>
            {bars.map((b) => (
              <tr key={b.key} className="border-t border-line">
                <td className="py-1">{b.detail.split(':')[0]}</td>
                <td className="py-1 text-right text-ink">
                  {b.value} {unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}
