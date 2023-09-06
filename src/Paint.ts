import {Brush} from '@/Brush'

export type Paint = {
  readonly size: number
  readonly color: string
  readonly opacity: number
  readonly brush: Brush
}
