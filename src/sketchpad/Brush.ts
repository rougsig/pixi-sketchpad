import * as PIXI from 'pixi.js'
import {BrushTextureFactory} from './BrushTextureFactory'
import {BrushConfig} from './BrushConfig'

export class Brush {
  private readonly textureFactory: BrushTextureFactory

  private _texture: PIXI.Texture = PIXI.Texture.EMPTY
  private _spacing: number = 1
  private _minSpacing: number = 1
  private _pressureAlphaScale: number = 1
  private _pressureSizeScale: number = 1

  public constructor(renderer: PIXI.Renderer, config: BrushConfig) {
    this.textureFactory = new BrushTextureFactory(renderer)
    this.setConfig(config)
  }

  public setConfig(config: BrushConfig): void {
    this._spacing = config.spacing
    this._minSpacing = config.minSpacing
    this._pressureAlphaScale = config.pressureSizeScale
    this._pressureSizeScale = config.pressureSizeScale

    this._texture.destroy(true)
    this._texture = this.textureFactory.create(config.size, config.hardness)
  }

  get texture(): PIXI.Texture {
    return this._texture
  }

  get size(): number {
    return Math.max(this._texture.width, this._texture.height)
  }

  get spacing(): number {
    return this._spacing
  }

  get minSpacing(): number {
    return this._minSpacing
  }

  getPressureSize(pressure: number): number {
    return this.size - (1 - pressure) * this.size * this._pressureSizeScale
  }

  getPressureAlpha(pressure: number): number {
    return 1 - (1 - pressure) * this._pressureAlphaScale
  }

  getPressureSpacing(pressure: number): number {
    return Math.max(this.minSpacing, this.getPressureSize(pressure) * this.spacing)
  }
}
