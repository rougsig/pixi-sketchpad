import * as PIXI from 'pixi.js'
import frag from './brush-texture-factory.frag?raw'
import {BrushTextureConfig} from '@/brush/BrushTextureConfig'

export class BrushTextureFactory {
  private readonly sprite: PIXI.Sprite
  private readonly filter: PIXI.Filter

  constructor(
    private readonly renderer: PIXI.Renderer,
  ) {
    this.filter = new PIXI.Filter(undefined, frag, undefined)

    this.sprite = new PIXI.Sprite()
    this.sprite.filters = [this.filter]
  }

  public create(config: BrushTextureConfig): PIXI.Texture {
    this.filter.uniforms.color = config.color
    this.filter.uniforms.hardness = config.hardness

    const texture = PIXI.RenderTexture.create({width: config.size, height: config.size})
    this.sprite.width = config.size
    this.sprite.height = config.size
    this.renderer.render(this.sprite, {renderTexture: texture})

    return texture
  }
}
