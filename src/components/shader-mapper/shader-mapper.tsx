import { Component, Element, Prop, Host, h } from '@stencil/core'

function Uniform(name, suffix, program, gl) {
  this.name = name
  this.suffix = suffix
  this.gl = gl
  this.program = program
  this.location = gl.getUniformLocation(program, name)
}

Uniform.prototype.set = function(...values) {
  let method = 'uniform' + this.suffix
  let args = [this.location].concat(values)
  this.gl[method].apply(this.gl, args)
}

function Rect(gl: any) {
  var buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, Rect.verts, gl.STATIC_DRAW)
}

Rect.verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])

Rect.prototype.render = function(gl: any) {
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}

@Component({
  tag: 'shader-mapper',
  styleUrl: 'shader-mapper.css',
  shadow: true,
})
export class Mapper {
  @Element() private element: HTMLElement

  @Prop() fragment: string
  @Prop() vertex: string

  canvas: HTMLCanvasElement
  context: any
  program: any
  output: any
  positionLocation: any
  startTime: any
  uTime: any

  loadedFragment: any
  loadedVertex: any

  componentDidLoad() {
    this.canvas = this.element.shadowRoot.querySelector('#canvas')
    this.context = this.canvas.getContext('webgl')

    this.startTime = new Date().getTime()

    const loaders = []
    const shaders = [
      { name: 'fragment', url: this.fragment },
      { name: 'vertex', url: this.vertex },
    ]
    const results: any = {}

    shaders.forEach(shader => {
      loaders.push(
        fetch(shader.url)
          .then(response => {
            return response.text()
          })
          .then(result => {
            results[shader.name] = result
          })
      )
    })

    Promise.all(loaders).then(() => {
      this.loadedFragment = results.fragment
      this.loadedVertex = results.vertex

      this.createScene()
      this.loop()
    })
  }

  createScene() {
    this.program = this.context.createProgram()

    this.addShader(this.loadedVertex, this.context.VERTEX_SHADER)
    this.addShader(this.loadedFragment, this.context.FRAGMENT_SHADER)

    this.context.linkProgram(this.program)
    this.context.useProgram(this.program)

    this.uTime = new Uniform('u_time', '1f', this.program, this.context)

    this.output = new Rect(this.context)
    this.positionLocation = this.context.getAttribLocation(
      this.program,
      'a_position'
    )
    this.context.enableVertexAttribArray(this.positionLocation)
    this.context.vertexAttribPointer(
      this.positionLocation,
      2,
      this.context.FLOAT,
      false,
      0,
      0
    )
  }

  addShader(source: any, type: any) {
    let shader = this.context.createShader(type)
    this.context.shaderSource(shader, source)
    this.context.compileShader(shader)
    let isCompiled = this.context.getShaderParameter(
      shader,
      this.context.COMPILE_STATUS
    )
    if (!isCompiled) {
      throw new Error(
        'Shader compile error: ' + this.context.getShaderInfoLog(shader)
      )
    }
    this.context.attachShader(this.program, shader)
  }

  loop() {
    let now = new Date().getTime()
    let currentTime = (now - this.startTime) / 1000
    this.uTime.set(currentTime)

    this.output.render(this.context)
    requestAnimationFrame(this.loop.bind(this))
  }

  render() {
    return (
      <Host>
        <canvas id="canvas"></canvas>
      </Host>
    )
  }
}
