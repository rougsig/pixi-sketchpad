import {StrokePath} from '@/StrokePath'
import {FederatedPointerEvent} from 'pixi.js'
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

  public getPathLength(): number {
    return this.path.getPoints().length
  }

  public down(e: FederatedPointerEvent): void {
    this.isPointerDown = true
    this.path.addPoint(createStrokePoint(e))
  }

  public move(e: FederatedPointerEvent): void {
    if (!this.isPointerDown) return
    this.path.addPoint(createStrokePoint(e))
  }

  public up(e: FederatedPointerEvent): void {
    this.path.addPoint(createStrokePoint(e))
    this.isPointerDown = false
  }

  public reset(): void {
    this.path.reset()
    this.isPointerDown = false
  }
}
