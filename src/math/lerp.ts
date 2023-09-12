export const lerp = (a: number, b: number, frac: number): number => {
  return a * (1 - frac) + b * frac
}
