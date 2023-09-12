import {Stroke} from '@/Stroke'
import {PointerEvent} from '@/PointerEvent'
import {StabilizedPainterConfig} from '@/StabilizedPainterConfig'
import {lerp} from '@/lerp'
import {clamp} from '@/clamp'

export class StabilizedPainter {
  private readonly length: number
  private readonly weight: number
  private readonly catchUp: boolean

  private readonly TICKER_SPEED_MS = 1000 / 120
  private tickerId: number | undefined = undefined

  private tail: PointerEvent[] = []

  constructor(
    private readonly stroke: Stroke,
    config: StabilizedPainterConfig,
  ) {
    this.length = config.length
    this.weight = config.weight
    this.catchUp = config.catchUp
  }

  public down(e: PointerEvent): void {
    this.tail = Array.from({length: this.length + 1}, () => PointerEvent.from(e))
    this.stroke.startStroke(e)
    this.startTicker()
  }

  public move(e: PointerEvent): void {
    const head = this.tail[0]
    head.set(e)
  }

  public up(e: PointerEvent): void {
    const head = this.tail[0]
    const last = this.tail[this.tail.length - 1]
    head.set(e)

    if (this.catchUp) {
      let dx: number
      let dy: number
      do {
        this.draw()
        dx = (last.x - head.x) | 0
        dy = (last.y - head.y) | 0
      } while (dx || dy)
    }

    this.stroke.endStroke(last)
    this.stopTicker()
  }

  private draw(): void {
    const f = 1 - clamp(this.weight, 0, 0.95)
    for (let i = 1; i < this.tail.length; ++i) {
      const curr = this.tail[i]
      const prev = this.tail[i - 1]
      curr.x = lerp(curr.x, prev.x, f)
      curr.y = lerp(curr.y, prev.y, f)
      curr.pressure = lerp(curr.pressure, prev.pressure, f)
    }

    const last = this.tail[this.length - 1]
    this.stroke.continueStroke(last)
  }

  private startTicker(): void {
    this.tickerId = window.setInterval(() => this.draw(), this.TICKER_SPEED_MS)
  }

  private stopTicker(): void {
    window.clearInterval(this.tickerId)
  }
}
