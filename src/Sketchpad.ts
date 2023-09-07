import * as PIXI from 'pixi.js'
import {FederatedPointerEvent} from 'pixi.js'
import {Cursor} from './Cursor'
import {Stroke} from '@/Stroke'
import {Brush} from '@/brush/Brush'
import {BrushFactory} from '@/brush/BrushFactory.ts'

export class Sketchpad {
  private stroke: Stroke | null = null
  private readonly brushFactory: BrushFactory
  private readonly brush: Brush
  private readonly cursor: Cursor = new Cursor()

  constructor(
    private readonly app: PIXI.Application,
  ) {
    this.brushFactory = new BrushFactory(app.renderer as PIXI.Renderer)
    this.brushFactory.setColor('#ff0000')
    this.brushFactory.setSize(64)
    this.brushFactory.setForceSize(1)
    this.brushFactory.setAlpha(1)
    this.brushFactory.setForceAlpha(0)
    this.brushFactory.setHardness(0.95)
    this.brushFactory.setSpacing(0.5)

    this.brush = this.brushFactory.create()
    this.cursor.setSize(this.brush.size)
    this.cursor.setVisibility(true)

    app.stage.addChild(this.cursor)
    app.stage.eventMode = 'static'
    app.stage.on('pointerdown', this.down)
    app.stage.on('globalpointermove', this.move)
    app.stage.on('pointerup', this.up)
  }

  private readonly down = (e: FederatedPointerEvent): void => {
    if (this.stroke != null) this.strokeDestroy()
    this.stroke = new Stroke(this.brush, this.app.renderer as PIXI.Renderer)
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
