import * as PIXI from 'pixi.js'
import {IDestroyOptions} from 'pixi.js'
import {ObjectPoolFactory} from '@pixi-essentials/object-pool'
import {Brush} from '@/Brush'
import {PointerEvent} from '@/PointerEvent'
import {lerp} from '@/lerp'
import {distance} from '@/distance'

export class Stroke extends PIXI.Container {
  private readonly STAMP_LIMIT = 1024

  private readonly live: PIXI.Container<PIXI.Sprite> = new PIXI.Container<PIXI.Sprite>()
  private readonly spriteObjectPool = ObjectPoolFactory.build(PIXI.Sprite)

  constructor(
    private readonly brush: Brush,
    private readonly color: string,
    private readonly renderer: PIXI.Renderer,
  ) {
    super()
    this.addChild(this.live)
  }

  private lastEvent: PointerEvent = new PointerEvent(0, 0, 0)

  public startStroke(e: PointerEvent): void {
    this.drawStamp(e)

    this.lastEvent = e
  }

  public continueStroke(e: PointerEvent): void {
    const dist = distance(this.lastEvent.x, this.lastEvent.y, e.x, e.y)
    const spacing = this.brush.getPressureSpacing(this.lastEvent.pressure)

    if (dist >= spacing) {
      const df = spacing / dist
      const lerpEvent = new PointerEvent(0, 0, 0)
      for (let f = df; f < 1.0; f += df) {
        lerpEvent.x = lerp(this.lastEvent.x, e.x, f)
        lerpEvent.y = lerp(this.lastEvent.y, e.y, f)
        lerpEvent.pressure = lerp(this.lastEvent.pressure, e.pressure, f)
        this.drawStamp(lerpEvent)
      }
      this.lastEvent = lerpEvent
    }
  }

  public endStroke(e: PointerEvent): void {
    this.lastEvent = e
  }

  private drawStamp(e: PointerEvent): void {
    const sprite = this.spriteObjectPool.allocate()

    sprite.texture = this.brush.texture
    sprite.width = this.brush.size
    sprite.height = this.brush.size

    sprite.tint = this.color
    sprite.alpha = this.brush.getPressureAlpha(e.pressure)

    sprite.position.set(e.x, e.y)
    sprite.anchor.set(0.5)
    sprite.scale.set(this.brush.getPressureSize(e.pressure) / this.brush.size)

    this.live.addChild(sprite)

    if (this.live.children.length > this.STAMP_LIMIT) {
      const snapshot = this.createSnapshot(this.live)
      this.spriteObjectPool.releaseArray(this.live.removeChildren())
      this.addChild(snapshot)
    }
  }

  private createSnapshot(container: PIXI.Container): PIXI.Sprite {
    const bounds = container.getBounds()
    const renderTexture = PIXI.RenderTexture.create({width: bounds.width, height: bounds.height})
    const transform = new PIXI.Matrix()
    transform.translate(-bounds.x, -bounds.y)
    this.renderer.render(container, {renderTexture, transform})

    const sprite = this.spriteObjectPool.allocate()
    sprite.texture = renderTexture
    sprite.width = bounds.width
    sprite.height = bounds.height
    sprite.x = bounds.x
    sprite.y = bounds.y

    return sprite
  }

  private cleanup(): void {
    this.spriteObjectPool.releaseArray(this.live.removeChildren())
  }

  public destroy(_options?: IDestroyOptions | boolean): void {
    this.cleanup()
    super.destroy(_options)
  }
}
