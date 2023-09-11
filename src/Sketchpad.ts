import * as PIXI from 'pixi.js'
import {FederatedPointerEvent} from 'pixi.js'
import {Cursor} from './Cursor'
import {Stroke} from '@/Stroke'
import {Brush} from '@/Brush'

export class Sketchpad {
  private stroke: Stroke | null = null
  private readonly brush: Brush
  private readonly cursor: Cursor = new Cursor()

  constructor(
    private readonly app: PIXI.Application,
  ) {
    this.brush = new Brush(
      app.renderer as PIXI.Renderer,
      {
        size: 32,
        hardness: 1,
        spacing: 0.1,
        minSpacing: 0.1,
        pressureAlphaScale: 1,
        pressureSizeScale: 1,
      },
    )
    this.cursor.setSize(this.brush.size)
    this.cursor.setVisibility(true)

    app.stage.addChild(this.cursor)
    const root = app.stage.getChildByName('root')!
    root.eventMode = 'static'
    root.on('pointerdown', this.down)
    root.on('globalpointermove', this.move)
    root.on('pointerup', this.up)
  }

  private readonly down = (e: FederatedPointerEvent): void => {
    if (this.stroke != null) this.strokeDestroy()
    this.stroke = new Stroke(this.brush, 'red', this.app.renderer as PIXI.Renderer)
    this.app.stage.addChild(this.stroke)
    this.stroke.startStroke(e.globalX, e.globalY, e.pressure)
  }

  private readonly move = (e: FederatedPointerEvent): void => {
    if (this.stroke == null) return
    this.stroke.continueStroke(e.globalX, e.globalY, e.pressure)
  }

  private readonly up = (e: FederatedPointerEvent): void => {
    if (this.stroke == null) return
    this.stroke.endStroke(e.globalX, e.globalY, e.pressure)
    this.strokeDestroy()
  }

  private strokeDestroy(): void {
    if (this.stroke == null) return
    this.stroke.destroy({children: true})
    this.stroke = null
  }

  public destroy(): void {
    this.strokeDestroy()
  }
}
