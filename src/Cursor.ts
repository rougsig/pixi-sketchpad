import * as PIXI from 'pixi.js'
import {FederatedPointerEvent} from 'pixi.js'

export class Cursor extends PIXI.Container {
  private readonly gfx = new PIXI.Graphics()

  constructor() {
    super()
    this.visible = false
    this.addChild(this.gfx)
    this.eventMode = 'static'
    this.onglobalpointermove = this.handlePointerMove
  }

  public handlePointerMove(e: FederatedPointerEvent): void {
    if (!this.visible) return
    this.position.set(e.globalX, e.globalY)
  }

  public setVisibility(isVisible: boolean): void {
    this.visible = isVisible
  }

  public setSize(size: number): void {
    const radius = size / 2

    this.gfx
      .clear()
      // outer black circle
      .lineStyle(1, 0x000000, 1, 1)
      .drawCircle(0, 0, radius)
      .closePath()
      // inner white circle
      .lineStyle(1, 0xffffff, 1, 0)
      .drawCircle(0, 0, radius)
      .closePath()
  }
}
