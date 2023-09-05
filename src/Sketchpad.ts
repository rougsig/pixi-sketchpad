import * as PIXI from 'pixi.js'
import {FederatedPointerEvent} from 'pixi.js'
import {Cursor} from './Cursor'
import {StrokeState} from '@/StrokeState.ts'
import {StrokePoint} from '@/StrokePoint.ts'

export class Sketchpad {
  private drawingPaper: PIXI.DisplayObject | null = null
  private strokeState: StrokeState = new StrokeState()
  private readonly previewContainer = new PIXI.Container()
  private readonly cursor: Cursor = new Cursor()

  constructor(
    private readonly app: PIXI.Application,
  ) {
    app.stage.addChild(this.previewContainer)
    app.stage.addChild(this.cursor)
    app.stage.eventMode = 'static'
    app.stage.on('pointerdown', this.down)
    app.stage.on('globalpointermove', this.move)
    app.stage.on('pointerup', this.up)
  }

  public setBrushSize(size: number): void {
    this.cursor.setSize(size)
  }

  public setDrawingPaper(paper: PIXI.DisplayObject | null): void {
    this.drawingPaper = paper
    this.cursor.setVisibility(paper != null)
  }

  private readonly down = (e: FederatedPointerEvent): void => {
    this.strokeState.down(e)
    this.renderStrokeBegin()
  }

  private renderStrokeBegin(): void {
    const point = this.strokeState.getPoint(0)
    const rect = this.createRect(point)
    this.previewContainer.addChild(rect)
  }

  private readonly move = (e: FederatedPointerEvent): void => {
    if (!this.strokeState.getIsPointerDown()) return
    this.strokeState.move(e)
    this.renderStrokeContinue()
  }

  private renderStrokeContinue(): void {
    console.log(this.previewContainer.children.length)
    const lastIndex = this.strokeState.getPathLength() - 1
    for (let i = lastIndex - 1; i < lastIndex; i += 0.05) {
      const rect = this.createRect(this.strokeState.getPoint(i))
      this.previewContainer.addChild(rect)
    }
  }

  private readonly up = (e: FederatedPointerEvent): void => {
    this.strokeState.up(e)
    this.renderStrokeEnd()
    this.strokeState.reset()
    this.previewContainer.removeChildren()
  }

  private renderStrokeEnd(): void {
    const lastIndex = this.strokeState.getPathLength() - 1
    for (let i = lastIndex - 1; i < lastIndex; i += 0.05) {
      const rect = this.createRect(this.strokeState.getPoint(i))
      this.previewContainer.addChild(rect)
    }
  }

  public destroy(): void {
    this.drawingPaper = null
  }

  private createRect(point: StrokePoint): PIXI.DisplayObject {
    const rect = new PIXI.Sprite(PIXI.Texture.WHITE)
    rect.x = point.x
    rect.y = point.y
    rect.width = 32
    rect.height = 32
    rect.tint = 'red'
    rect.anchor.set(0.5)
    return rect
  }
}
