import * as PIXI from 'pixi.js'
import {BrushConfig} from '@/BrushConfig'

export class Brush {
  private brushTexture: PIXI.Texture
  private grainTexture: PIXI.Texture

  constructor(
    private readonly config: BrushConfig,
  ) {
    this.brushTexture = PIXI.Texture.EMPTY
    this.grainTexture = PIXI.Texture.EMPTY
  }

  public async load(): Promise<void> {
    if (this.isLoaded()) return Promise.resolve()
    const baseUrl = new URL('/brush', import.meta.url).href
    this.brushTexture = await PIXI.Texture.fromURL(`${baseUrl}/${this.getName()}/brush.png`)
    this.grainTexture = await PIXI.Texture.fromURL(`${baseUrl}/${this.getName()}/grain.png`)
  }

  public isLoaded(): boolean {
    return this.brushTexture !== PIXI.Texture.EMPTY && this.grainTexture !== PIXI.Texture.EMPTY
  }

  // region getters

  public getBrushTexture(): PIXI.Texture {
    return this.brushTexture
  }

  public getGrainTexture(): PIXI.Texture {
    return this.grainTexture
  }

  public getName(): string {
    return this.config.name
  }

  public getLabel(): string {
    return this.config.label
  }

  public getPressureOpacity(): number {
    return this.config.pressureOpacity
  }

  public getPressureSize(): number {
    return this.config.pressureSize
  }

  public getScale(): number {
    return this.config.scale
  }

  public getTiltOpacity(): number {
    return this.config.tiltOpacity
  }

  public getTiltSize(): number {
    return this.config.tiltSize
  }

  public getMovement(): number {
    return this.config.movement
  }

  public getPressureBleed(): number {
    return this.config.pressureBleed
  }

  public getSpacing(): number {
    return this.config.spacing
  }

  // endregion getters
}

export const PencilBrush = new Brush({
  name: 'pencil',
  label: 'Pencil',
  pressureOpacity: 0.7,
  pressureSize: 0.8,
  scale: 0.8,
  tiltOpacity: 0.3,
  tiltSize: 1,
  movement: 1,
  pressureBleed: 1,
  spacing: 0.05,
})
