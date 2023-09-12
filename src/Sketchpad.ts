import * as PIXI from 'pixi.js'
import {Cursor} from './Cursor'
import {Stroke} from '@/Stroke'
import {Brush} from '@/Brush'
import {PointerEvent} from '@/PointerEvent'
import {StabilizedPainter} from '@/StabilizedPainter'

export class Sketchpad {
  private painter: StabilizedPainter | null = null
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
        minSpacing: 0.5,
        pressureAlphaScale: 1,
        pressureSizeScale: 1,
      },
    )
    this.cursor.setSize(this.brush.size)
    this.cursor.setVisibility(true)

    app.stage.addChild(this.cursor)
    const root = app.stage.getChildByName('root')!
    root.eventMode = 'static'
    root.on('pointerdown', e => this.down(PointerEvent.from(e)))
    root.on('globalpointermove', e => this.move(PointerEvent.from(e)))
    root.on('pointerup', e => this.up(PointerEvent.from(e)))
  }

  private readonly down = (e: PointerEvent): void => {
    if (this.stroke != null) this.destroyPainter()
    this.stroke = new Stroke(this.brush, 'red', this.app.renderer as PIXI.Renderer)
    this.app.stage.addChild(this.stroke)
    this.painter = new StabilizedPainter(this.stroke, {length: 5, weight: 0.5, catchUp: true})
    this.painter.down(e)
  }

  private readonly move = (e: PointerEvent): void => {
    if (this.painter == null) return
    this.painter.move(e)
  }

  private readonly up = (e: PointerEvent): void => {
    if (this.painter == null) return
    this.painter.up(e)
    this.destroyPainter()
  }

  private destroyPainter(): void {
    if (this.painter != null) {
      this.painter = null
    }
    if (this.stroke != null) {
      this.stroke.destroy({children: true})
      this.stroke = null
    }
  }

  public destroy(): void {
    this.destroyPainter()
  }
}
