import * as PIXI from 'pixi.js'
import {Brush} from '@/brush/Brush.ts'
import {BrushTextureFactory} from '@/brush/BrushTextureFactory.ts'
import {hexToArray} from '@/hexToArray.ts'

export class BrushFactory {
  readonly brushTextureFactory: BrushTextureFactory
  private color: number[] = [0, 0, 0]
  private size: number = 0
  private forceSize: number = 0
  private alpha: number = 0
  private forceAlpha: number = 0
  private hardness: number = 0
  private spacing: number = 0

  constructor(
    renderer: PIXI.Renderer,
  ) {
    this.brushTextureFactory = new BrushTextureFactory(renderer)
  }

  public create(): Brush {
    const texture = this.brushTextureFactory.create({size: this.size, color: this.color, hardness: this.hardness})

    return {
      texture: texture,
      size: this.size,
      forceSize: this.forceSize,
      alpha: this.alpha,
      forceAlpha: this.forceAlpha,
      spacing: this.spacing,
      destroy: () => texture.destroy(true),
    }
  }

  // region setters

  public setSize(size: number): void {
    this.size = size
  }

  public setColor(hex: string): void {
    this.color = hexToArray(hex)
  }

  public setAlpha(alpha: number): void {
    this.alpha = alpha
  }

  public setForceAlpha(forceAlpha: number): void {
    this.forceAlpha = forceAlpha
  }

  public setForceSize(forceSize: number): void {
    this.forceSize = forceSize
  }

  public setSpacing(spacing: number): void {
    this.spacing = spacing
  }

  public setHardness(hardness: number): void {
    this.hardness = hardness
  }

  // endregion
}
