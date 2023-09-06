import {lerp} from '@/lerp'
import {StrokePoint} from '@/StrokePoint'

export class StrokePath {
  private points: Array<StrokePoint> = []

  constructor() {
  }

  public addPoint(point: StrokePoint): void {
    this.points.push(point)
  }

  public getPoints(): ReadonlyArray<StrokePoint> {
    return this.points
  }

  public getPoint(offset: number): StrokePoint {
    if (Number.isInteger(offset)) return this.points[offset]

    return this.interpolate(
      this.points[Math.floor(offset)],
      this.points[Math.ceil(offset)],
      offset % 1,
    )
  }

  public reset(): void {
    this.points = []
  }

  private interpolate(a: StrokePoint, b: StrokePoint, frac: number): StrokePoint {
    return {
      x: lerp(a.x, b.x, frac),
      y: lerp(a.y, b.y, frac),
      pressure: lerp(a.pressure, b.pressure, frac),
      tiltAngle: lerp(a.tiltAngle, b.tiltAngle, frac),
      tilt: lerp(a.tilt, b.tilt, frac),
    }
  }
}
