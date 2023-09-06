import * as PIXI from 'pixi.js'
import {CLEAR_MODES, FilterState, FilterSystem, RenderTexture} from 'pixi.js'
import fragment from '@/brushnode.frag?raw'

export class BrushNodeFilter extends PIXI.Filter {
  private readonly grainMatrix: PIXI.Matrix

  constructor(
    private readonly grainSprite: PIXI.Sprite,
  ) {
    super(
      undefined,
      fragment,
      {
        // color
        uRed: {type: '1f', value: 0.5},
        uGreen: {type: '1f', value: 0.5},
        uBlue: {type: '1f', value: 0.5},

        // node
        uOpacity: {type: '1f', value: 1},
        uRotation: {type: '1f', value: 0},

        // grain
        uBleed: {type: '1f', value: 0},
        uGrainRotation: {type: '1f', value: 0},
        uGrainScale: {type: '1f', value: 1},
        u_x_offset: {type: '1f', value: 0},
        u_y_offset: {type: '1f', value: 0},

        // brush
        u_offset_px: {type: 'vec2'},
        u_node_scale: {type: 'vec2', value: [0.0, 0.0]},

        // grain texture
        u_grainTex: {type: 'sampler2D', value: ''},

        // environment (via PIXI and Filter)
        dimensions: {type: 'vec2', value: [0.0, 0.0]},
        filterMatrix: {type: 'mat3'},
      },
    )

    this.padding = 0
    this.blendMode = PIXI.BLEND_MODES.NORMAL

    // via https://github.com/pixijs/pixi.js/wiki/v4-Creating-Filters#fitting-problem
    this.autoFit = false

    let grainMatrix = new PIXI.Matrix()

    grainSprite.renderable = false
    this.grainSprite = grainSprite
    this.grainMatrix = grainMatrix
    this.uniforms.u_grainTex = grainSprite.texture
    this.uniforms.filterMatrix = grainMatrix
  }

  apply(filterManager: FilterSystem, input: RenderTexture, output: RenderTexture, clearMode?: CLEAR_MODES, _currentState?: FilterState) {
    this.uniforms.dimensions[0] = input.frame.width
    this.uniforms.dimensions[1] = input.frame.height

    this.uniforms.filterMatrix = filterManager.calculateSpriteMatrix(this.grainMatrix, this.grainSprite)

    filterManager.applyFilter(this, input, output, clearMode)

    // console.log('filterMatrix', this.uniforms.filterMatrix)

    // to log Filter-added uniforms:
    // let shader = this.glShaders[filterManager.renderer.CONTEXT_UID]
    // if (shader) {
    // console.log('dimensions', this.uniforms.dimensions)
    // console.log('filterArea', shader.uniforms.filterArea)
    // console.log('filterClamp', shader.uniforms.filterClamp)
    // console.log('vFilterCoord', shader.uniforms.vFilterCoord)
    // }
  }
}
