import {FederatedPointerEvent} from 'pixi.js'

export type StrokePoint = {
  x: number
  y: number
  pressure: number
  tiltAngle: number
  tilt: number
}

export const createStrokePoint = (e: FederatedPointerEvent): StrokePoint => ({
  x: e.globalX,
  y: e.globalY,
  pressure: calcPressure(e),
  tilt: calcTilt(e),
  tiltAngle: calcTiltAngle(e),
})

const calcPressure = (e: FederatedPointerEvent): number => {
  return e.pointerType === 'mouse'
    ? e.pressure > 0 ? 0.5 : 0
    : e.pressure
}

const calcTilt = (e: FederatedPointerEvent): number => {
  return e.pointerType === 'mouse'
    ? 37
    : Math.max(Math.abs(e.tiltX), Math.abs(e.tiltY))
}

const calcTiltAngle = (e: FederatedPointerEvent): number => {
  return e.pointerType === 'mouse'
    ? -90
    : Math.atan2(e.tiltY, e.tiltX) * (180 / Math.PI)
}
