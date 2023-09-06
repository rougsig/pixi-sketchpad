import {lerp} from '@/lerp'
import {StrokePathPoint} from '@/StrokePathPoint'

export class StrokePath {
  private points: Array<StrokePathPoint> = []

  constructor() {
  }

  public addPoint(point: StrokePathPoint): void {
    this.points.push(point)
  }

  public getPoints(): ReadonlyArray<StrokePathPoint> {
    return this.points
  }

  public getPoint(offset: number): StrokePathPoint {
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

  private interpolate(a: StrokePathPoint, b: StrokePathPoint, frac: number): StrokePathPoint {
    return {
      x: lerp(a.x, b.x, frac),
      y: lerp(a.y, b.y, frac),
      pressure: lerp(a.pressure, b.pressure, frac),
      tiltAngle: lerp(a.tiltAngle, b.tiltAngle, frac),
      tilt: lerp(a.tilt, b.tilt, frac),
    }
  }
}
