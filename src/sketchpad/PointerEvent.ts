import * as PIXI from 'pixi.js'

export class PointerEvent {
  private _x: number
  private _y: number
  private _pressure: number

  constructor(x: number, y: number, pressure: number) {
    this._x = x
    this._y = y
    this._pressure = pressure
  }

  static from(e: PointerEvent | PIXI.FederatedPointerEvent): PointerEvent {
    if (e instanceof PointerEvent) {
      return new PointerEvent(
        e.x,
        e.y,
        e.pressure,
      )
    } else {
      return new PointerEvent(
        e.globalX,
        e.globalY,
        e.pointerType === 'mouse' ? 1 : e.pressure,
      )
    }
  }

  public set(e: PointerEvent): void {
    this._x = e.x
    this._y = e.y
    this._pressure = e.pressure
  }

  get x(): number {
    return this._x
  }

  set x(value: number) {
    this._x = value
  }

  get y(): number {
    return this._y
  }

  set y(value: number) {
    this._y = value
  }

  get pressure(): number {
    return this._pressure
  }

  set pressure(value: number) {
    this._pressure = value
  }
}
