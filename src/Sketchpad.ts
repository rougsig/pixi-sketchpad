import * as PIXI from 'pixi.js'
import {FederatedPointerEvent} from 'pixi.js'
import {Cursor} from './Cursor'
import {Stroke} from '@/Stroke'

export class Sketchpad {
  private stroke: Stroke | null = null
  private readonly cursor: Cursor = new Cursor()

  constructor(
    private readonly app: PIXI.Application,
  ) {
    app.stage.addChild(this.cursor)
    app.stage.eventMode = 'static'
    app.stage.on('pointerdown', this.down)
    app.stage.on('globalpointermove', this.move)
    app.stage.on('pointerup', this.up)
  }

  public setBrushVisibility(isVisible: boolean): void {
    this.cursor.setVisibility(isVisible)
  }

  public setBrushSize(size: number): void {
    this.cursor.setSize(size)
  }

  private readonly down = (e: FederatedPointerEvent): void => {
    if (this.stroke != null) this.strokeDestroy()
    this.stroke = new Stroke(this.app.renderer as PIXI.Renderer)
    this.app.stage.addChild(this.stroke)
    this.stroke.down(e)
  }

  private readonly move = (e: FederatedPointerEvent): void => {
    if (this.stroke == null) return
    this.stroke.move(e)
  }

  private readonly up = (e: FederatedPointerEvent): void => {
    if (this.stroke == null) return
    this.stroke.up(e)
    this.strokeDestroy()
  }

  private strokeDestroy(): void {
    if (this.stroke == null) return
    this.stroke.destroy({children: true})
    this.stroke = null
  }

  public destroy(): void {
    // TODO off all events
    this.strokeDestroy()
  }
}
