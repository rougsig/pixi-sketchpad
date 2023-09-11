import * as PIXI from 'pixi.js'
import {PointerEvent} from './event/PointerEvent.ts'
import {Cursor} from './Cursor'
import {Stroke} from '@/Stroke'
import {Brush} from '@/brush/Brush'
import {BrushFactory} from '@/brush/BrushFactory.ts'
import line from './line3.json'

export class Sketchpad {
  private stroke: Stroke | null = null
  private readonly brushFactory: BrushFactory
  private readonly debugPointTexture: PIXI.Texture
  private readonly brush: Brush
  private readonly cursor: Cursor = new Cursor()

  constructor(
    private readonly app: PIXI.Application,
  ) {
    this.brushFactory = new BrushFactory(app.renderer as PIXI.Renderer)
    this.brushFactory.setColor('#ff0000')
    this.brushFactory.setSize(16)
    this.brushFactory.setForceSize(0.99)
    this.brushFactory.setAlpha(1)
    this.brushFactory.setForceAlpha(0)
    this.brushFactory.setHardness(0.9)
    this.brushFactory.setSpacing(0.1)
    this.debugPointTexture = this.brushFactory.brushTextureFactory.create({size: 8, color: [0, 0, 0], hardness: 1})

    this.brush = this.brushFactory.create()
    this.cursor.setSize(this.brush.size)
    this.cursor.setVisibility(true)

    app.stage.addChild(this.cursor)
    const root = app.stage.getChildByName('root')!
    root.eventMode = 'static'
    root.on('pointerdown', this.down)
    root.on('globalpointermove', this.move)
    root.on('pointerup', this.up)

    line.forEach(ev => this.fakeEvent(ev))
  }

  private fakeEvent(ev: { type: string, pointerType: string, x: number, y: number, pressure: number }): PointerEvent {
    // @ts-expect-error
    this[ev.type]({
      globalX: ev.x,
      globalY: ev.y,
      pressure: ev.pressure,
      pointerType: ev.pointerType,
      tiltY: 0,
      tiltX: 0,
    })
  }

  private readonly down = (e: PointerEvent): void => {
    console.log('down', e.globalX, e.globalY, e.tiltX, e.tiltY, e.pressure, e.pointerType)
    if (this.stroke != null) this.strokeDestroy()
    this.stroke = new Stroke(
      this.brush,
      this.debugPointTexture,
      this.app.renderer as PIXI.Renderer,
    )
    this.app.stage.addChild(this.stroke)
    this.stroke.down(e)
  }

  private readonly move = (e: PointerEvent): void => {
    if (this.stroke == null) return
    console.log('move', e.globalX, e.globalY, e.tiltX, e.tiltY, e.pressure, e.pointerType)
    this.stroke.move(e)
  }

  private readonly up = (e: PointerEvent): void => {
    if (this.stroke == null) return
    console.log('up', e.globalX, e.globalY, e.tiltX, e.tiltY, e.pressure, e.pointerType)
    this.stroke.up(e)
    this.strokeDestroy()
  }

  private strokeDestroy(): void {
    if (this.stroke == null) return
    // this.stroke.destroy({children: true})
    this.stroke = null
  }

  public destroy(): void {
    // TODO off all events
    this.strokeDestroy()
  }
}
