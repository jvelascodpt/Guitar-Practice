/** The five classic fret-button colours: green, red, yellow, blue, orange. */
export const FRET = ['#22c55e', '#ef4444', '#facc15', '#3b82f6', '#f97316']
export const fret = (i: number) => FRET[i % FRET.length]
