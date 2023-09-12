import * as PIXI from 'pixi.js'
import {Story} from '@ladle/react'
import {useEffect, useMemo, useRef} from 'react'
import {Sketchpad} from './Sketchpad'

export const Example: Story = () => {
  const pixiContainer = useRef<HTMLDivElement>(null)

  const app = useMemo(() => {
    const pixi = new PIXI.Application<HTMLCanvasElement>({
      width: 768,
      height: 768,
      background: '#CCCCCC',
    })

    // @ts-ignore
    globalThis.__PIXI_APP__ = pixi

    return pixi
  }, [])

  useEffect(() => {
    const container = pixiContainer.current
    const view = app.view
    if (container != null) {
      container.appendChild(view)
      const sprite = new PIXI.Sprite(PIXI.Texture.WHITE)
      sprite.name = 'root'
      sprite.width = 512
      sprite.height = 512
      sprite.x = 128
      sprite.y = 128
      app.stage.addChild(sprite)

      const sketchpad = new Sketchpad(app)
      return () => {
        container.removeChild(view)
        sketchpad.destroy()
      }
    }
  }, [app, pixiContainer])

  return (
    <div ref={pixiContainer}/>
  )
}
