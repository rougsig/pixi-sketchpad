import {StrokePath} from '@/StrokePath'
import {PointerEvent} from './event/PointerEvent.ts'
import {createStrokePoint, StrokePathPoint} from '@/StrokePathPoint'

export class StrokeState {
  private readonly path: StrokePath = new StrokePath()
  private isPointerDown: boolean = false

  constructor() {
  }

  public getIsPointerDown(): boolean {
    return this.isPointerDown
  }

  public getPoint(offset: number): StrokePathPoint {
    return this.path.getPoint(offset)
  }

  public getLastPoint(): StrokePathPoint {
    return this.getPoint(this.getPathLength() - 1)
  }

  public getPathLength(): number {
    return this.path.getPoints().length
  }

  public down(e: PointerEvent): void {
    this.isPointerDown = true
    this.path.addPoint(createStrokePoint(e))
  }

  public move(e: PointerEvent): void {
    if (!this.isPointerDown) return
    this.path.addPoint(createStrokePoint(e))
  }

  public up(e: PointerEvent): void {
    this.path.addPoint(createStrokePoint(e))
    this.isPointerDown = false
  }

  public reset(): void {
    this.path.reset()
    this.isPointerDown = false
  }
}
