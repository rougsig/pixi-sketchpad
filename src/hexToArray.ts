export const hexToArray = (hex: string) => {
  const color = parseInt(hex.replace('#', ''), 16)
  const r = color >> 16
  const g = (color & 0x00ffff) >> 8
  const b = color & 0x0000ff

  return [r / 255, g / 255, b / 255]
}
