import React from 'react'
import styles from './display-object-form.module.scss'

export type DisplayObjectFormProps = {
  x: number
  y: number
  width: number
  height: number
  angle: number
  opacity: number
  lockAspectRatio: boolean
}

export const DisplayObjectForm: React.FC<DisplayObjectFormProps> = React.memo(
  ((
    {
      x,
      y,
      width,
      height,
      angle,
      opacity,
      lockAspectRatio,
    },
  ) => {
    return (
      <div className={styles.grid}>
        <p>x</p>
        <input value={x}/>
        <p>y</p>
        <input value={y}/>

        <p>width</p>
        <input value={width}/>
        <p>height</p>
        <input value={height}/>

        <p>angle</p>
        <input value={angle}/>
        <p>opacity</p>
        <input value={opacity}/>
      </div>
    )
  }),
  (prev, next) => (
    prev.x === next.x && prev.y === next.y &&
    prev.width === next.width && prev.height === next.height &&
    prev.angle === next.angle && prev.opacity === next.opacity &&
    prev.lockAspectRatio === next.lockAspectRatio
  ),
)
