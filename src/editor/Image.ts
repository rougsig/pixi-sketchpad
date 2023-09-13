import * as PIXI from 'pixi.js'
import {randomColor} from '@/util'

export class Image extends PIXI.Container {
  sprite: PIXI.Sprite

  constructor(name: string) {
    super()

    this.name = name
    this.sprite = new PIXI.Sprite(PIXI.Texture.WHITE)
    this.sprite.tint = randomColor()
    this.eventMode = 'static'

    this.addChild(this.sprite)
  }
}
