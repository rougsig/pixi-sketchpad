import * as PIXI from 'pixi.js'
import {Story} from '@ladle/react'
import {useEffect, useMemo, useRef} from 'react'
import {Editor} from './Editor'

export const Example: Story = () => {
  const pixiContainer = useRef<HTMLDivElement>(null)

  const app = useMemo(() => {
    const pixi = new PIXI.Application<HTMLCanvasElement>({
      width: window.innerWidth,
      height: window.innerHeight,
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
      const editor = new Editor(app)
      return () => {
        container.removeChild(view)
        editor.destroy()
      }
    }
  }, [app, pixiContainer])

  return (
    <div style={{overflow: 'hidden', width: '100vw', height: '100vh'}}>
      <div ref={pixiContainer}/>
    </div>
  )
}
