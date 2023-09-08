import {PointerEvent} from './event/PointerEvent.ts'

export type StrokePathPoint = {
  readonly x: number
  readonly y: number
  readonly force: number
  readonly tiltAngle: number
  readonly tilt: number
}

export const createStrokePoint = (e: PointerEvent): StrokePathPoint => ({
  x: e.globalX,
  y: e.globalY,
  force: calcPressure(e),
  tilt: calcTilt(e),
  tiltAngle: calcTiltAngle(e),
})

const calcPressure = (e: PointerEvent): number => {
  return e.pointerType === 'mouse'
    ? e.pressure > 0 ? 0.5 : 0
    : e.pressure
}

const calcTilt = (e: PointerEvent): number => {
  return e.pointerType === 'mouse'
    ? 37
    : Math.max(Math.abs(e.tiltX), Math.abs(e.tiltY))
}

const calcTiltAngle = (e: PointerEvent): number => {
  return e.pointerType === 'mouse'
    ? -90
    : Math.atan2(e.tiltY, e.tiltX) * (180 / Math.PI)
}
