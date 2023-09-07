import * as PIXI from 'pixi.js'
import frag from './brush-texture-factory.frag?raw'
import {BrushTextureConfig} from '@/brush/BrushTextureConfig.ts'

export class BrushTextureFactory {
  private readonly sprite: PIXI.Sprite
  private readonly filter: PIXI.Filter

  constructor(
    private readonly renderer: PIXI.Renderer,
  ) {
    const config: BrushTextureConfig = {
      size: 32,
      color: [1.0, 1.0, 1.0],
      hardness: 1.0,
    }
    this.filter = new PIXI.Filter(undefined, frag, config)

    this.sprite = new PIXI.Sprite()
    this.sprite.filters = [this.filter]
  }

  public create(config: BrushTextureConfig): PIXI.Texture {
    this.filter.uniforms.size = config.size
    this.filter.uniforms.color = config.color
    this.filter.uniforms.hardness = config.hardness

    const texture = PIXI.RenderTexture.create({width: config.size, height: config.size})
    this.sprite.width = config.size
    this.sprite.height = config.size
    this.renderer.render(this.sprite, {renderTexture: texture})

    return texture
  }
}
