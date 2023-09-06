import * as PIXI from 'pixi.js'
import {FederatedPointerEvent} from 'pixi.js'
import {Cursor} from './Cursor'
import {Stroke} from '@/Stroke'
import {PencilBrush} from '@/Brush'
import {Paint} from '@/Paint.ts'

// TODO: Remove
PencilBrush.load()

export class Sketchpad {
  private stroke: Stroke | null = null
  // TODO: add nullable state, move configuration to outside
  private paint: Paint = {color: 'red', size: 32, opacity: 0.25, brush: PencilBrush}
  private readonly cursor: Cursor = new Cursor()

  constructor(
    private readonly app: PIXI.Application,
  ) {
    app.stage.addChild(this.cursor)
    app.stage.eventMode = 'static'
    app.stage.on('pointerdown', this.down)
    app.stage.on('globalpointermove', this.move)
    app.stage.on('pointerup', this.up)
    this.setBrushSize(this.paint.size)
    this.setBrushVisibility(true)
  }

  public setBrushVisibility(isVisible: boolean): void {
    this.cursor.setVisibility(isVisible)
  }

  public setBrushSize(size: number): void {
    this.cursor.setSize(size)
  }

  private readonly down = (e: FederatedPointerEvent): void => {
    if (this.stroke != null) this.strokeDestroy()
    this.stroke = new Stroke(this.paint, this.app.renderer as PIXI.Renderer)
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
