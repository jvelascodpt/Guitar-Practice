import type { CSSProperties } from 'react'
import type { DateKey } from '../lib/dates'
import { cx } from './ui'

/**
 * Sheen the Shredder: the app's cartoon guitarist and assistant. Drawn in SVG
 * so he's crisp, tiny and works offline. His look (hair, outfit, accessory,
 * guitar) is picked from the date, so it changes every day and stays the
 * same all day. He idles (head nod, foot tap, blink) and shreds when chords play.
 */

// ---------- daily look ----------
const SKIN = '#efc39b'
const SKIN_SHADE = '#d9a77f'

const HAIR_STYLES = ['swoop', 'spiky', 'curtain', 'messy', 'buzz'] as const
const HAIR_COLORS = [
  { c: '#1b1512', name: 'black' },
  { c: '#1b1512', name: 'black' },
  { c: '#3b2a20', name: 'dark brown' },
  { c: '#6b6460', name: 'ash grey' },
  { c: '#2b6cb0', name: 'blue-dyed' },
  { c: '#c2417a', name: 'pink-dyed' },
]
const SHIRTS = [
  { c: '#ef4444', name: 'red' },
  { c: '#f6f3ff', name: 'white' },
  { c: '#22c55e', name: 'green' },
  { c: '#facc15', name: 'yellow' },
  { c: '#3b82f6', name: 'blue' },
  { c: '#1f1f25', name: 'black' },
  { c: '#a855f7', name: 'purple' },
]
type Jacket = { kind: 'none' | 'jacket' | 'hoodie'; c: string; name: string }
const JACKETS: Jacket[] = [
  { kind: 'none', c: '', name: '' },
  { kind: 'jacket', c: '#1e1e22', name: 'leather jacket' },
  { kind: 'jacket', c: '#35588a', name: 'denim jacket' },
  { kind: 'jacket', c: '#4d5a2f', name: 'bomber jacket' },
  { kind: 'hoodie', c: '', name: 'hoodie' },
]
const GRAPHICS = ['star', 'bolt', 'stripe', 'none'] as const
const PANTS = ['#26344d', '#1d1d22', '#7d6f52', '#3d3d48']
const SHOES = ['#f4f4f5', '#ef4444', '#1d1d22', '#facc15']
const ACCESSORIES = ['none', 'shades', 'beanie', 'cap', 'headband', 'none', 'shades'] as const
const GUITAR_SHAPES = [
  { k: 'double', name: 'double-cut' },
  { k: 'vee', name: 'flying V' },
  { k: 'star', name: 'star-shaped' },
  { k: 'horns', name: 'devil-horn' },
  { k: 'single', name: 'single-cut' },
] as const
const GUITAR_COLORS = [
  { c: '#22c55e', name: 'green' },
  { c: '#ef4444', name: 'red' },
  { c: '#facc15', name: 'yellow' },
  { c: '#3b82f6', name: 'blue' },
  { c: '#f97316', name: 'orange' },
  { c: '#111114', name: 'black' },
  { c: '#f4f1ea', name: 'white' },
  { c: 'sunburst', name: 'sunburst' },
]

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}
const pick = <T,>(arr: readonly T[], date: string, salt: string) => arr[hash(date + salt) % arr.length]

export function sheenLook(date: DateKey) {
  const shirt = pick(SHIRTS, date, 's')
  let jacket: Jacket = pick(JACKETS, date, 'j')
  if (jacket.kind === 'hoodie') jacket = { kind: 'hoodie', c: shirt.c, name: `${shirt.name} hoodie` }
  let guitarColor = pick(GUITAR_COLORS, date, 'gc')
  // Don't let the guitar vanish into the shirt.
  if (guitarColor.c === shirt.c) guitarColor = GUITAR_COLORS[(GUITAR_COLORS.indexOf(guitarColor) + 3) % GUITAR_COLORS.length]
  return {
    hair: pick(HAIR_STYLES, date, 'h'),
    hairColor: pick(HAIR_COLORS, date, 'hc'),
    shirt,
    jacket,
    graphic: pick(GRAPHICS, date, 'g'),
    pants: pick(PANTS, date, 'p'),
    shoes: pick(SHOES, date, 'sh'),
    accessory: pick(ACCESSORIES, date, 'a'),
    guitar: pick(GUITAR_SHAPES, date, 'gs'),
    guitarColor,
  }
}
export type SheenLook = ReturnType<typeof sheenLook>

export function describeLook(l: SheenLook): string {
  const top = l.jacket.kind === 'none' ? `${l.shirt.name} tee` : l.jacket.kind === 'hoodie' ? l.jacket.name : `${l.jacket.name} over a ${l.shirt.name} tee`
  const extra = l.accessory === 'shades' ? ', shades on' : l.accessory === 'beanie' ? ', beanie' : l.accessory === 'cap' ? ', cap backwards' : l.accessory === 'headband' ? ', headband' : ''
  return `${top}${extra}, and my ${l.guitarColor.name} ${l.guitar.name} guitar`
}

// ---------- drawing ----------
function Hair({ style, c }: { style: SheenLook['hair']; c: string }) {
  switch (style) {
    case 'spiky':
      return <path d="M43 32 L44 18 L50 24 L52 11 L58 20 L62 8 L66 20 L71 12 L72 23 L78 18 L77 32 C70 25 52 24 43 32 Z" fill={c} />
    case 'curtain':
      return <path d="M42.5 35 C41 19 51 14 60 14 C69 14 79 19 77.5 35 C75 27 67 23 60 21 C53 23 45 27 42.5 35 Z" fill={c} />
    case 'messy':
      return (
        <path
          d="M42 33 C38 26 43 20 47 20 C47 14 54 12 57 15 C60 10 67 11 69 16 C74 14 79 19 77 24 C81 28 79 33 77 34 C73 26 66 25 60 26 C53 25 47 27 42 33 Z"
          fill={c}
        />
      )
    case 'buzz':
      return <path d="M43.5 29 C45 17 75 17 76.5 29 C70 24 50 24 43.5 29 Z" fill={c} />
    default: // swoop: side-swept fringe
      return <path d="M42.5 33 C41 18 52 12 62 12.5 C72 13 79.5 20 77.5 32 C74 26 69 23.5 61 24 C55 28 49 31 42.5 33 Z" fill={c} />
  }
}

function Accessory({ kind, color }: { kind: SheenLook['accessory']; color: string }) {
  switch (kind) {
    case 'shades':
      return (
        <g>
          <rect x="49.5" y="31.5" width="9" height="6" rx="2.5" fill="#111" />
          <rect x="61.5" y="31.5" width="9" height="6" rx="2.5" fill="#111" />
          <rect x="58.5" y="33" width="3" height="1.4" fill="#111" />
          <rect x="51" y="32.5" width="3" height="1.4" rx="0.7" fill="#fff" opacity=".5" />
        </g>
      )
    case 'beanie':
      return (
        <g>
          <path d="M41.5 30 C41.5 12 78.5 12 78.5 30 Z" fill={color} />
          <rect x="40.5" y="27" width="39" height="6" rx="3" fill={color} stroke="rgba(0,0,0,.25)" strokeWidth="0.8" />
          <circle cx="60" cy="13" r="3.5" fill={color} />
        </g>
      )
    case 'cap':
      return (
        <g>
          <path d="M42 29 C42 15 78 15 78 29 Z" fill={color} />
          <rect x="74" y="25.5" width="9" height="4" rx="2" fill={color} stroke="rgba(0,0,0,.3)" strokeWidth="0.8" />
          <circle cx="60" cy="17.5" r="1.4" fill="rgba(0,0,0,.3)" />
        </g>
      )
    case 'headband':
      return <rect x="42" y="23.5" width="36" height="4.5" rx="2" fill={color} />
    default:
      return null
  }
}

function GuitarBody({ shape, fill }: { shape: SheenLook['guitar']['k']; fill: string }) {
  // Drawn spanning x 0..34 around y 0, then mirrored so the body sits below-left.
  const d = {
    double: 'M0 -6 C2 -13 9 -15 13 -10 C17 -15 27 -14 31 -8 C36 -1 35 7 30 11 C23 16 9 16 3 11 C-1 7 -1 1 0 -6 Z',
    vee: 'M0 -2.5 L35 -17 L37 -11 L11 0 L37 11 L35 17 L0 2.5 Z',
    star: 'M0 -4 L21 -16 L36 -15 L27 -3 L36 12 L10 11 L0 4 Z',
    horns: 'M0 -7 C4 -12 9 -12 12 -8 L17 -14 C26 -15 33 -9 33 0 C33 10 25 15 16 12.5 C8 13.5 2 10 0 6 Z',
    single: 'M0 -6 C2 -12 8 -11 12 -9 C18 -16 30 -13 33 -3 C35 6 28 15 16 14 C6 14 0 9 0 4 Z',
  }[shape]
  return <path d={d} fill={fill} stroke="rgba(0,0,0,.35)" strokeWidth="0.9" />
}

export type SheenMode = 'idle' | 'walk' | 'shred' | 'dance'

export function SheenFigure({
  look,
  playing: playingProp,
  mode = 'idle',
  className,
  style,
}: {
  look: SheenLook
  playing?: boolean
  mode?: SheenMode
  className?: string
  style?: CSSProperties
}) {
  // Shredding and dancing both get the "in the zone" face and flying notes.
  const playing = playingProp || mode === 'shred' || mode === 'dance'
  const gFill = look.guitarColor.c === 'sunburst' ? 'url(#sheen-burst)' : look.guitarColor.c
  const sleeve = look.jacket.kind === 'none' ? look.shirt.c : look.jacket.c
  const accColor = look.shirt.c === '#1f1f25' ? '#ef4444' : look.shirt.c
  const grStroke = look.shirt.c === '#f6f3ff' || look.shirt.c === '#facc15' ? '#1f1f25' : '#ffffff'
  const pivot = (x: number, y: number): CSSProperties => ({ transformBox: 'view-box', transformOrigin: `${x}px ${y}px` })

  return (
    <svg viewBox="0 0 120 140" className={cx('sheen', `sheen-mode-${playingProp ? 'shred' : mode}`, playing && 'sheen-playing', className)} style={style} role="img" aria-label="Sheen the Shredder">
      <defs>
        <radialGradient id="sheen-burst" cx="35%" cy="50%" r="70%">
          <stop offset="0" stopColor="#ffd36b" />
          <stop offset=".55" stopColor="#d9480f" />
          <stop offset="1" stopColor="#3b0d02" />
        </radialGradient>
      </defs>
      {/* stage shadow */}
      <ellipse cx="60" cy="133" rx="28" ry="4" fill="rgba(0,0,0,.35)" />

      <g className="sheen-bob">
        {/* legs + shoes */}
        <g className="sheen-leg-l" style={pivot(51, 93)}>
          <rect x="45" y="92" width="12" height="30" rx="4" fill={look.pants} />
          <rect x="40" y="119" width="18" height="8" rx="4" fill={look.shoes} stroke="rgba(0,0,0,.3)" strokeWidth=".8" />
        </g>
        <g className="sheen-leg-r" style={pivot(69, 93)}>
          <rect x="63" y="92" width="12" height="30" rx="4" fill={look.pants} />
          <g className="sheen-foot" style={pivot(66, 126)}>
            <rect x="62" y="119" width="18" height="8" rx="4" fill={look.shoes} stroke="rgba(0,0,0,.3)" strokeWidth=".8" />
          </g>
        </g>

        {/* hoodie hood behind the head */}
        {look.jacket.kind === 'hoodie' && <path d="M44 56 C40 44 80 44 76 56 Z" fill={look.shirt.c} stroke="rgba(0,0,0,.25)" strokeWidth=".8" />}

        {/* torso */}
        <path d="M42 59 Q42 54 48 54 L72 54 Q78 54 78 59 L80 94 L40 94 Z" fill={look.shirt.c} stroke="rgba(0,0,0,.2)" strokeWidth=".8" />
        {look.graphic === 'star' && <path d="M60 62 l2.4 5 5.4.6-4 3.7 1.1 5.4-4.9-2.7-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z" fill="none" stroke={grStroke} strokeWidth="1.4" />}
        {look.graphic === 'bolt' && <path d="M62 60 l-6 10 h5 l-3 9 8-12 h-5 l3-7z" fill={grStroke} />}
        {look.graphic === 'stripe' && <rect x="41" y="68" width="38" height="4" fill={grStroke} opacity=".85" />}
        {(look.jacket.kind === 'jacket' || look.jacket.kind === 'hoodie') && (
          <g fill={look.jacket.kind === 'hoodie' ? look.shirt.c : look.jacket.c} stroke="rgba(0,0,0,.3)" strokeWidth=".8">
            {look.jacket.kind === 'jacket' ? (
              <>
                <path d="M42 59 Q42 54 48 54 L55 54 L53 70 L52 94 L40 94 Z" />
                <path d="M78 59 Q78 54 72 54 L65 54 L67 70 L68 94 L80 94 Z" />
                <path d="M55 54 L53 63 L49 56 Z M65 54 L67 63 L71 56 Z" fill="rgba(0,0,0,.25)" />
              </>
            ) : (
              <>
                <path d="M57 57 L56 66 M63 57 L64 66" fill="none" stroke="#f6f3ff" strokeWidth="1" />
                <rect x="50" y="80" width="20" height="8" rx="3" fill="rgba(0,0,0,.15)" stroke="none" />
              </>
            )}
          </g>
        )}

        {/* guitar: body lower-left, neck up to the right */}
        <g transform="translate(47 88) rotate(-24)">
          <g transform="scale(-1 1)">
            <GuitarBody shape={look.guitar.k} fill={gFill} />
            <rect x="8" y="-5" width="5" height="10" rx="1" fill="#1f1f25" opacity=".85" />
            <rect x="17" y="-4" width="2" height="8" fill="#d4d4d8" />
            <circle cx="24" cy="7" r="1.6" fill="#e4e4e7" />
            <circle cx="28" cy="4" r="1.6" fill="#e4e4e7" />
          </g>
          <rect x="0" y="-2.6" width="50" height="5.2" rx="1" fill="#6b3f1f" />
          {[8, 16, 24, 32, 40].map((x) => (
            <rect key={x} x={x} y="-2.6" width=".7" height="5.2" fill="#d4d4d8" />
          ))}
          <path d="M50 -3.5 L60 -5 L60 5 L50 3.5 Z" fill={look.guitarColor.c === 'sunburst' ? '#3b0d02' : look.guitarColor.c} stroke="rgba(0,0,0,.35)" strokeWidth=".8" />
          {[-1.4, 0, 1.4].map((y) => (
            <line key={y} x1="-18" y1={y} x2="57" y2={y} stroke="#f4f4f5" strokeWidth=".35" opacity=".9" />
          ))}
        </g>

        {/* fretting arm (to the neck) */}
        <path d="M76 59 Q88 64 85 72" fill="none" stroke={sleeve} strokeWidth="7" strokeLinecap="round" />
        <circle cx="84" cy="73.5" r="4" fill={SKIN} stroke={SKIN_SHADE} strokeWidth=".8" />

        {/* strumming arm (swings from the shoulder) */}
        <g className="sheen-strum" style={pivot(44, 58)}>
          <path d="M44 58 Q34 70 40 84" fill="none" stroke={sleeve} strokeWidth="7" strokeLinecap="round" />
          <circle cx="41" cy="87" r="4.2" fill={SKIN} stroke={SKIN_SHADE} strokeWidth=".8" />
          <path d="M43 89 l3.5 2 -3 2.4z" fill="#facc15" />
        </g>

        {/* head (nods from the neck) */}
        <g className="sheen-head" style={pivot(60, 52)}>
          <rect x="56" y="47" width="8" height="8" rx="2" fill={SKIN_SHADE} />
          <circle cx="42.8" cy="36" r="3.4" fill={SKIN} />
          <circle cx="77.2" cy="36" r="3.4" fill={SKIN} />
          <circle cx="60" cy="34" r="17.5" fill={SKIN} />
          <Hair style={look.hair} c={look.hairColor.c} />
          {/* face */}
          <g className="sheen-eyes" style={pivot(60, 35)}>
            {playing ? (
              <>
                <path d="M51.5 35.5 Q54 32.5 56.5 35.5" fill="none" stroke="#2b1d14" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M63.5 35.5 Q66 32.5 68.5 35.5" fill="none" stroke="#2b1d14" strokeWidth="1.6" strokeLinecap="round" />
              </>
            ) : (
              <>
                <ellipse cx="54" cy="35" rx="2.1" ry="2.7" fill="#2b1d14" />
                <ellipse cx="66" cy="35" rx="2.1" ry="2.7" fill="#2b1d14" />
                <circle cx="54.7" cy="34" r=".7" fill="#fff" />
                <circle cx="66.7" cy="34" r=".7" fill="#fff" />
              </>
            )}
          </g>
          <path d="M50.5 29.5 L57 28.6 M63 28.6 L69.5 29.5" stroke="#2b1d14" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="49.5" cy="40.5" r="2.4" fill="#f59e9e" opacity=".45" />
          <circle cx="70.5" cy="40.5" r="2.4" fill="#f59e9e" opacity=".45" />
          {playing ? (
            <path d="M55 42 Q60 49 65 42 Z" fill="#7a2a1d" stroke="#2b1d14" strokeWidth=".9" />
          ) : (
            <path d="M55.5 42 Q60 46 64.5 42" fill="none" stroke="#2b1d14" strokeWidth="1.4" strokeLinecap="round" />
          )}
          <Accessory kind={look.accessory} color={accColor} />
        </g>
      </g>

      {/* notes fly off while he plays */}
      {playing && (
        <g fill="#facc15" fontSize="12" fontWeight="700">
          <text className="sheen-note" x="88" y="70" style={{ animationDelay: '0s' }}>
            ♪
          </text>
          <text className="sheen-note" x="96" y="80" style={{ animationDelay: '.45s', fill: '#22c55e' }}>
            ♫
          </text>
          <text className="sheen-note" x="84" y="84" style={{ animationDelay: '.9s', fill: '#3b82f6' }}>
            ♪
          </text>
        </g>
      )}
    </svg>
  )
}
