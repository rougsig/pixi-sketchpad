import * as PIXI from 'pixi.js'
import frag from './brush-texture-factory.frag?raw'

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

  public create(size: number, hardness: number): PIXI.Texture {
    this.filter.uniforms.hardness = hardness

    const texture = PIXI.RenderTexture.create({width: size, height: size})
    this.sprite.width = size
    this.sprite.height = size
    this.renderer.render(this.sprite, {renderTexture: texture})

    return texture
  }
}
