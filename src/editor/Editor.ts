import * as PIXI from 'pixi.js'
import {Image} from './Image'
import {Transformer} from '@pixi-essentials/transformer'

export class Editor {
  private readonly selected: Array<PIXI.DisplayObject> = []
  private readonly transformer: Transformer

  constructor(
    private readonly app: PIXI.Application,
  ) {
    for (let i = 0; i < 4; i++) {
      const img = new Image(`image-${i}`)
      if (i === 1) {
        img.width = 256
        img.height = 256
        img.x = 256
        img.y = 256
        img.sprite.tint = '#FFFFFF'
        img.sprite.blendMode = PIXI.BLEND_MODES.ERASE
      }
      this.selected.push(img)
      app.stage.addChild(img)
    }
    app.stage.eventMode = 'static'

    this.transformer = new Transformer({group: this.selected, stage: app.stage})
    this.app.stage.addChild(this.transformer)

    const ev = new PIXI.EventBoundary(app.stage)
    window.addEventListener('click', e => {
      const obj = ev.hitTest(e.x, e.y)
      if (obj == null) {
        this.selected.length = 0
        console.log(this.selected)
        return
      }
      if (!(obj instanceof Image)) return
      if (e.shiftKey) {
        this.selected.push(obj)
        console.log(this.selected)
        return
      }
      this.selected.length = 0
      this.selected.push(obj)
      console.log(this.selected)
    })
  }

  public destroy(): void {
  }
}
