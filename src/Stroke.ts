import * as PIXI from 'pixi.js'
import {FederatedPointerEvent, IDestroyOptions} from 'pixi.js'
import {StrokeState} from '@/StrokeState'
import {StrokePathPoint} from '@/StrokePathPoint'
import {ObjectPoolFactory} from '@pixi-essentials/object-pool'
import {Paint} from '@/Paint'
import {BrushNodeFilter} from '@/BrushNodeFilter.ts'

export class Stroke extends PIXI.Container {
  private readonly STAMP_LIMIT = 1024

  private readonly live: PIXI.Container<PIXI.Sprite> = new PIXI.Container<PIXI.Sprite>()
  private readonly state: StrokeState = new StrokeState()
  private readonly spriteObjectPool = ObjectPoolFactory.build(PIXI.Sprite)

  constructor(
    private readonly paint: Paint,
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
    for (let i = from; i < to; i += this.paint.brush.getSpacing()) {
      this.drawStamp(this.state.getPoint(i))
    }
  }

  private drawStamp(point: StrokePathPoint): void {
    const sprite = this.createSprite(point)
    this.live.addChild(sprite)
    if (this.live.children.length > this.STAMP_LIMIT) {
      const snapshot = this.createSnapshot(this.live)
      this.spriteObjectPool.releaseArray(this.live.removeChildren())
      this.addChild(snapshot)
    }
  }

  private createSprite(point: StrokePathPoint): PIXI.Sprite {
    const paint = this.paint
    const brush = this.paint.brush

    // ---
    const sprite = this.spriteObjectPool.allocate()
    sprite.texture = brush.getBrushTexture()

    // ---

    let nodeSize = paint.size - (1 - point.pressure) * paint.size * brush.getPressureSize()
    let tiltSizeMultiple = (((point.tilt / 90.0) * brush.getTiltSize()) * 3) + 1
    nodeSize *= tiltSizeMultiple

    let nodeOpacity = 1 - (1 - point.pressure) * brush.getPressureOpacity()
    let tiltOpacity = 1 - point.tilt / 90.0 * brush.getTiltOpacity()
    nodeOpacity *= tiltOpacity * paint.opacity

    let nodeRotation: number
    let azimuth = true // TODO: understand what it really do
    if (azimuth) {
      nodeRotation = point.tiltAngle * Math.PI / 180.0 // - this.sketchPaneContainer.rotation
    } else {
      nodeRotation = 0
    }

    let uBleed = Math.pow(1 - point.pressure, 1.6) * brush.getPressureBleed()

    // sprite must fit a texture rotated by up to 45 degrees
    let rad = Math.PI * 45 / 180 // extreme angle in radians
    let spriteSize = Math.abs(nodeSize * Math.sin(rad)) + Math.abs(nodeSize * Math.cos(rad))

    // the brush node
    // is larger than the texture size
    // because, although the x,y coordinates must be integers,
    //   we still want to draw sub-pixels,
    //     so we pad 1px
    //       allowing us to draw a on positive x, y offset
    // and, although, the dimensions must be integers,
    //   we want to have a sub-pixel texture size,
    //     so we sometimes make the node larger than necessary
    //       and scale the texture down to correct
    // to allow us to draw a rotated texture,
    //   we increase the size to accommodate for up to 45 degrees of rotation
    let iS = Math.ceil(spriteSize)
    let x = point.x - iS / 2
    let y = point.y - iS / 2
    sprite.x = Math.floor(x)
    sprite.y = Math.floor(y)
    sprite.width = iS
    sprite.height = iS

    let dX = x - sprite.x
    let dY = y - sprite.y
    let dS = nodeSize / sprite.width

    let oXY = [dX, dY]
    let oS = [dS, dS]

    // filter setup
    //
    // TODO can we avoid creating a new grain sprite for each render?
    //      used for rendering grain filter texture at correct position
    let grainSprite = new PIXI.Sprite(brush.getGrainTexture())
    // this.offscreenContainer.addChild(grainSprite)
    // hacky fix to calculate vFilterCoord properly
    // this.offscreenContainer.getLocalBounds()
    let filter = new BrushNodeFilter(grainSprite)

    filter.uniforms.uRed = 1
    filter.uniforms.uGreen = 0
    filter.uniforms.uBlue = 0
    filter.uniforms.uOpacity = nodeOpacity

    filter.uniforms.uRotation = nodeRotation

    filter.uniforms.uBleed = uBleed

    filter.uniforms.uGrainScale = 1

    // DEPRECATED
    filter.uniforms.uGrainRotation = 0

    // TODO calculate random on down event
    let grainOffsetX = 0
    let grainOffsetY = 0
    filter.uniforms.u_x_offset = grainOffsetX * brush.getMovement()
    filter.uniforms.u_y_offset = grainOffsetY * brush.getMovement()

    // subpixel offset
    filter.uniforms.u_offset_px = oXY // TODO multiply by app.stage.scale if zoomed
    // console.log('iX', iX, 'iY', iY, 'u_offset_px', oXY)
    // subpixel scale AND padding AND rotation accomdation
    filter.uniforms.u_node_scale = oS // desired scale
    filter.padding = 1 // for filterClamp

    sprite.filters = [filter]
    // via https://github.com/pixijs/pixi.js/wiki/v4-Creating-Filters#bleeding-problem
    // @popelyshev this property is for Sprite, not for filter. Thans to TypeScript!
    // @popelyshev at the same time, the fix only makes it worse :(
    // sprite.filterArea = this.app.screen

    // ---
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
