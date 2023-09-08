import * as PIXI from 'pixi.js'

export type Brush = {
  texture: PIXI.Texture
  spacing: number
  // add flow logic, it's like alpha, but for brush texture
  alpha: number
  forceAlpha: number
  size: number
  forceSize: number
  destroy: () => void
}

// import * as PIXI from 'pixi.js'
// import {BrushTextureFactory} from '@/brush/BrushTextureFactory'
//
// export class Brush {
//   private readonly textureFactory: BrushTextureFactory
//   private texture: PIXI.Texture
//   private spacing: number
//   private alpha: number
//
//   constructor(renderer: PIXI.Renderer) {
//     this.textureFactory = new BrushTextureFactory(renderer)
//     this.spacing = 1
//     this.alpha = 1
//     this.texture = this.textureFactory.create({size: 32, color: [0, 0, 0], hardness: 0.5})
//   }
//
//   // region getters
//
//   public getTexture(): PIXI.Texture {
//     return this.texture
//   }
//
//   public getSpacing(): number {
//     return this.spacing
//   }
//
//   public getAlpha(): number {
//     return this.alpha
//   }
//
//   public getSize(): number {
//     return this.texture.width
//   }
//
//   // endregion
// }
