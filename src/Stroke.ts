import * as PIXI from 'pixi.js'
import {FederatedPointerEvent, IDestroyOptions} from 'pixi.js'
import {StrokeState} from '@/StrokeState'
import {StrokePoint} from '@/StrokePoint.ts'
import {ObjectPoolFactory} from '@pixi-essentials/object-pool'

export class Stroke extends PIXI.Container {
  private readonly STAMP_SPACING = 0.05
  private readonly STAMP_LIMIT = 1024

  private readonly live: PIXI.Container<PIXI.Sprite> = new PIXI.Container<PIXI.Sprite>()
  private readonly state: StrokeState = new StrokeState()
  private readonly spriteObjectPool = ObjectPoolFactory.build(PIXI.Sprite)

  constructor(
    private readonly renderer: PIXI.Renderer,
  ) {
    super()
    this.addChild(this.live)
  }

  public down(e: FederatedPointerEvent): void {
    this.state.down(e)
    this.drawStamp(this.state.getPoint(0))
  }

  public move(e: FederatedPointerEvent): void {
    this.state.move(e)
    const length = this.state.getPathLength()
    this.drawStroke(length - 2, length - 1)
  }

  public up(e: FederatedPointerEvent): void {
    this.state.up(e)
    const length = this.state.getPathLength()
    this.drawStroke(length - 2, length - 1)
    // DO STROKE SAVE
    this.cleanup()
  }

  private drawStroke(from: number, to: number): void {
    for (let i = from; i < to; i += this.STAMP_SPACING) {
      this.drawStamp(this.state.getPoint(i))
    }
  }

  private drawStamp(point: StrokePoint): void {
    const sprite = this.createSprite(point)
    this.live.addChild(sprite)
    if (this.live.children.length > this.STAMP_LIMIT) {
      const snapshot = this.createSnapshot(this.live)
      this.spriteObjectPool.releaseArray(this.live.removeChildren())
      this.addChild(snapshot)
    }
  }

  private createSprite(point: StrokePoint): PIXI.Sprite {
    const sprite = this.spriteObjectPool.allocate()
    sprite.texture = PIXI.Texture.WHITE
    sprite.x = point.x
    sprite.y = point.y
    sprite.width = 32
    sprite.height = 32
    sprite.tint = 'red'
    sprite.anchor.set(0.5)
    return sprite
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
    this.state.reset()
    this.spriteObjectPool.releaseArray(this.live.removeChildren())
    this.removeChildren()
    this.addChild(this.live)
  }

  public destroy(_options?: IDestroyOptions | boolean): void {
    this.cleanup()
    super.destroy(_options)
  }
}
