import * as PIXI from 'pixi.js'
import {FederatedPointerEvent, IDestroyOptions} from 'pixi.js'
import {StrokeState} from '@/StrokeState'
import {StrokePathPoint} from '@/StrokePathPoint'
import {ObjectPoolFactory} from '@pixi-essentials/object-pool'
import {Brush} from '@/brush/Brush'

export class Stroke extends PIXI.Container {
  private readonly STAMP_LIMIT = 1024

  private readonly live: PIXI.Container<PIXI.Sprite> = new PIXI.Container<PIXI.Sprite>()
  private readonly state: StrokeState = new StrokeState()
  private readonly spriteObjectPool = ObjectPoolFactory.build(PIXI.Sprite)

  private lastPoint: StrokePathPoint | null = null

  constructor(
    private readonly brush: Brush,
    private readonly renderer: PIXI.Renderer,
  ) {
    super()
    this.addChild(this.live)
  }

  public down(e: FederatedPointerEvent): void {
    this.state.down(e)
    this.drawPoint(this.state.getPoint(0))
  }

  public move(e: FederatedPointerEvent): void {
    this.state.move(e)
    this.drawLine(this.state.getPathLength() - 1)
  }

  public up(e: FederatedPointerEvent): void {
    this.state.up(e)
    this.drawLine(this.state.getPathLength() - 1)
    // DO STROKE SAVE
    this.cleanup()
  }

  private drawLine(to: number): void {
    const fromPoint = this.lastPoint
    if (fromPoint == null) return
    const toPoint = this.state.getPoint(to)

    const startSpacing = this.calcBrushSize(fromPoint) * this.brush.spacing

    const dx = fromPoint.x - toPoint.x
    const dy = fromPoint.y - toPoint.y

    let length = Math.sqrt(dx ** 2 + dy ** 2) - startSpacing
    let dst = length

    // TODO: draw line without holes...
    let point = toPoint
    let i = 0
    while (dst >= this.calcBrushSize(point) * this.brush.spacing) {
      this.drawPoint(point)
      console.log('draw', ++i, dst)
      dst -= this.calcBrushSize(point) * this.brush.spacing
      point = this.state.getPoint(to - dst / length)
    }

    // const size = this.calcBrushSize(this.brush, toPoint)
    // if (dst >= size * this.brush.spacing) {
    //   const additionalPoints = Math.ceil(dst / size / this.brush.spacing)
    //   console.log(additionalPoints)
    //   for (let i = 1; i < additionalPoints; i++) {
    //     //console.log(to, 1 / additionalPoints * i)
    //     this.drawPoint(to - 1 / additionalPoints * i)
    //   }
    // }
  }

  private drawPoint(point: StrokePathPoint): void {
    const sprite = this.createSprite(point)
    this.live.addChild(sprite)
    this.lastPoint = point

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
    sprite.alpha = alpha
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
    this.spriteObjectPool.releaseArray(this.live.removeChildren())
    this.removeChildren()
    this.addChild(this.live)
  }

  public destroy(_options?: IDestroyOptions | boolean): void {
    this.cleanup()
    super.destroy(_options)
  }
}
