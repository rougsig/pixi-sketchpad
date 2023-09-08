import * as PIXI from 'pixi.js'
import {PointerEvent} from './event/PointerEvent.ts'
import {Cursor} from './Cursor'
import {Stroke} from '@/Stroke'
import {Brush} from '@/brush/Brush'
import {BrushFactory} from '@/brush/BrushFactory.ts'

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
    this.brushFactory.setSize(32)
    this.brushFactory.setForceSize(0)
    this.brushFactory.setAlpha(1)
    this.brushFactory.setForceAlpha(0)
    this.brushFactory.setHardness(1)
    this.brushFactory.setSpacing(1)
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

    this.down(this.fakeEvent(256, 256))
    this.move(this.fakeEvent(256, 256))
    this.move(this.fakeEvent(256 + 32 * 8, 256))
    this.up(this.fakeEvent(0, 0))
  }

  private fakeEvent(x: number, y: number): PointerEvent {
    return {globalX:x, globalY: y, pressure: 1, pointerType: 'mouse', tiltY: 0, tiltX: 0}
  }

  private readonly down = (e: PointerEvent): void => {
    console.log('down', e.globalX, e.globalY)
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
    console.log('move', e.globalX, e.globalY)
    this.stroke.move(e)
  }

  private readonly up = (e: PointerEvent): void => {
    if (this.stroke == null) return
    console.log('up', e.globalX, e.globalY)
    this.stroke.up(e)
    this.strokeDestroy()
  }

  private strokeDestroy(): void {
    if (this.stroke == null) return
    //this.stroke.destroy({children: true})
    this.stroke = null
  }

  public destroy(): void {
    // TODO off all events
    this.strokeDestroy()
  }
}
