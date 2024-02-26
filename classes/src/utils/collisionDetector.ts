export type Vector2 = [number, number]

export const lerp = (x1: number, x2: number, offset: number) => x1 + (x2 - x1) * offset

export const getIntersection = (
  A: Vector2,
  B: Vector2,
  C: Vector2,
  D: Vector2,
  offsetRange: Vector2 = [0, 1],
): Vector2 | undefined => {
  const bottom = (D[1] - C[1]) * (B[0] - A[0]) - (D[0] - C[0]) * (B[1] - A[1])
  if (bottom === 0) return

  const top1 = (D[0] - C[0]) * (A[1] - C[1]) - (D[1] - C[1]) * (A[0] - C[0])
  const offset1 = top1 / bottom
  if (offset1 < offsetRange[0] || offset1 > offsetRange[1]) return

  const top2 = (C[1] - A[1]) * (A[0] - B[0]) - (C[0] - A[0]) * (A[1] - B[1])
  const offset2 = top2 / bottom
  if (offset2 < offsetRange[0] || offset2 > offsetRange[1]) return

  return [lerp(A[0], B[0], offset1), lerp(A[1], B[1], offset1)]
}
