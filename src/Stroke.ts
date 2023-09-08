import * as PIXI from 'pixi.js'
import {IDestroyOptions} from 'pixi.js'
import {PointerEvent} from './event/PointerEvent.ts'
import {StrokeState} from '@/StrokeState'
import {StrokePathPoint} from '@/StrokePathPoint'
import {ObjectPoolFactory} from '@pixi-essentials/object-pool'
import {Brush} from '@/brush/Brush'

export class Stroke extends PIXI.Container {
  private readonly STAMP_LIMIT = 1024

  private readonly live: PIXI.Container<PIXI.Sprite> = new PIXI.Container<PIXI.Sprite>()
  private readonly debug: PIXI.Container<PIXI.Sprite> = new PIXI.Container<PIXI.Sprite>()
  private readonly state: StrokeState = new StrokeState()
  private readonly spriteObjectPool = ObjectPoolFactory.build(PIXI.Sprite)

  private distance: number = 0
  private lastPointOffset: number = 0

  constructor(
    private readonly brush: Brush,
    private readonly debugPointTexture: PIXI.Texture,
    private readonly renderer: PIXI.Renderer,
  ) {
    super()
    this.addChild(this.live)
    this.addChild(this.debug)
  }

  public down(e: PointerEvent): void {
    this.state.down(e)
    this.drawPoint(0)
    const orig = this.brush.texture
    this.brush.texture = this.debugPointTexture
    this.drawPoint(0)
    this.brush.texture = orig
    this.distance = 0
  }

  public move(e: PointerEvent): void {
    this.state.move(e)
    const pathLength = this.state.getPathLength()
    this.distance += this.calculateDistance(
      this.state.getPoint(pathLength - 2),
      this.state.getPoint(pathLength - 1),
    )
    const orig = this.brush.texture
    this.brush.texture = this.debugPointTexture
    this.drawPoint(pathLength - 1)
    this.brush.texture = orig
    this.drawLine(this.state.getPathLength() - 1)
  }

  public up(e: PointerEvent): void {
    this.state.up(e)
    // DO STROKE SAVE
    this.cleanup()
  }

  private drawLine(to: number): void {
    const from = this.lastPointOffset
    const fromPoint = this.state.getPoint(from)
    const toPoint = this.state.getPoint(to)
    const length = to - from
    let progress = this.calculateProgress(this.calcBrushSize(fromPoint) * this.brush.spacing, this.distance)
    let drawn = 0
    while (progress <= 1) {
      const offset = from + length * progress
      const point = this.state.getPoint(offset)
      this.drawPoint(offset)
      drawn = this.distance * progress
      progress += this.calculateProgress(this.calcBrushSize(point) * this.brush.spacing, this.distance)
    }
    this.distance -= drawn
  }

  private calculateDistance(a: StrokePathPoint, b: StrokePathPoint): number {
    const dx = a.x - b.x
    const dy = a.y - b.y
    return Math.sqrt(dx ** 2 + dy ** 2)
  }

  private calculateProgress(value: number, total: number): number {
    return value / total
  }

  private drawPoint(offset: number): void {
    const point = this.state.getPoint(offset)
    const sprite = this.createSprite(point)
    if (sprite.texture === this.debugPointTexture) {
      this.debug.addChild(sprite)
    } else {
      this.live.addChild(sprite)
      this.lastPointOffset = offset
    }


    if (this.live.children.length > this.STAMP_LIMIT) {
      const snapshot = this.createSnapshot(this.live)
      this.spriteObjectPool.releaseArray(this.live.removeChildren())
      this.addChild(snapshot)
    }
  }

  private calcBrushSize(point: StrokePathPoint): number {
    return this.brush.size - (1 - point.force) * this.brush.size * this.brush.forceSize
  }

  private calcBrushAlpha(point: StrokePathPoint): number {
    return 1 - (1 - point.force) * this.brush.forceAlpha
  }

  private createSprite(point: StrokePathPoint): PIXI.Sprite {
    const brush = this.brush

    const sprite = this.spriteObjectPool.allocate()
    sprite.texture = brush.texture
    sprite.width = brush.size
    sprite.height = brush.size

    const size = this.calcBrushSize(point)
    const alpha = this.calcBrushAlpha(point)

    sprite.position.set(point.x, point.y)
    sprite.anchor.set(0.5)
    // sprite.alpha = alpha
    sprite.alpha = 0.25
    sprite.scale.set(size / brush.size)

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
    //this.spriteObjectPool.releaseArray(this.live.removeChildren())
    //this.removeChildren()
    //this.addChild(this.live)
  }

  public destroy(_options?: IDestroyOptions | boolean): void {
    this.cleanup()
    super.destroy(_options)
  }
}
