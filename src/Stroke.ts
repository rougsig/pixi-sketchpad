import * as PIXI from 'pixi.js'
import {IDestroyOptions} from 'pixi.js'
import {ObjectPoolFactory} from '@pixi-essentials/object-pool'
import {Brush} from '@/Brush'
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

  private lastX: number = 0
  private lastY: number = 0
  private lastPressure: number = 0

  public startStroke(x: number, y: number, pressure: number): void {
    this.drawStamp(x, y, pressure)

    this.lastX = x
    this.lastY = y
    this.lastPressure = pressure
  }

  public continueStroke(x: number, y: number, pressure: number): void {
    const dist = distance(this.lastX, this.lastY, x, y)
    const spacing = this.brush.getPressureSpacing(this.lastPressure)

    if (dist >= spacing) {
      const df = spacing / dist

      let nx = this.lastX
      let ny = this.lastY
      let np = this.lastPressure

      for (let f = df; f < 1.0; f += df) {
        nx = lerp(this.lastX, x, f)
        ny = lerp(this.lastY, y, f)
        np = lerp(this.lastPressure, pressure, f)
        this.drawStamp(nx, ny, np)
      }

      this.lastX = nx
      this.lastY = ny
      this.lastPressure = np
    }
  }

  public endStroke(x: number, y: number, pressure: number): void {
    this.lastX = x
    this.lastY = y
    this.lastPressure = pressure
  }

  private drawStamp(x: number, y: number, pressure: number): void {
    const sprite = this.spriteObjectPool.allocate()

    sprite.texture = this.brush.texture
    sprite.width = this.brush.size
    sprite.height = this.brush.size

    sprite.tint = this.color

    const alpha = this.brush.getPressureAlpha(pressure)
    sprite.alpha = alpha

    sprite.position.set(x, y)
    sprite.anchor.set(0.5)

    const size = this.brush.getPressureSize(pressure)
    sprite.scale.set(size / this.brush.size)

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
