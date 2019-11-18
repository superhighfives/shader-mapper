import { Component, Element, Prop, Host, h } from '@stencil/core'
import { Uniform, Rect } from '../../utils/utils'

@Component({
  tag: 'shader-mapper',
  styleUrl: 'shader-mapper.css',
  shadow: true,
})
export class Mapper {
  @Element() private element: HTMLElement

  @Prop() fragment: string
  @Prop() vertex: string
  @Prop() image: string

  canvas: HTMLCanvasElement
  context: any

  ratio: any
  width: any
  height: any
  windowWidth: any
  windowHeight: any

  program: any
  textures: any
  output: any
  positionLocation: any
  startTime: any
  imageAspect: any

  uTime: any
  uResolution: any
  uRatio: any
  uThreshold: any

  loadedFragment: any
  loadedVertex: any
  loadedImages: any

  componentDidLoad() {
    this.canvas = this.element.shadowRoot.querySelector('#canvas')
    this.context = this.canvas.getContext('webgl')
    this.ratio = window.devicePixelRatio

    this.startTime = new Date().getTime()

    const loaders = []
    const images = this.image.split(',')
    const shaders = [
      { name: 'fragment', url: this.fragment },
      { name: 'vertex', url: this.vertex },
    ]
    const loadedShaders: any = {}
    const loadedImages: any = []

    shaders.forEach(shader => {
      loaders.push(
        fetch(shader.url)
          .then(response => {
            return response.text()
          })
          .then(result => {
            loadedShaders[shader.name] = result
          })
      )
    })

    images.forEach(url => {
      loaders.push(
        new Promise((resolve, reject) => {
          const img = new Image()
          img.addEventListener('load', () => {
            loadedImages.push(img)
            resolve()
          })
          img.addEventListener('error', () => {
            reject(new Error(`Failed to load image's URL: ${url}`))
          })
          img.src = url
        })
      )
    })

    Promise.all(loaders).then(() => {
      this.loadedFragment = loadedShaders.fragment
      this.loadedVertex = loadedShaders.vertex
      this.loadedImages = loadedImages

      this.createScene()
      this.createTextures()
      this.setSizes()
      this.loop()
    })
  }

  createTextures() {
    const images = this.loadedImages
    this.imageAspect = images[0].naturalHeight / images[0].naturalWidth

    this.textures = []

    for (var i = 0; i < images.length; i++) {
      let texture = this.context.createTexture()
      this.context.bindTexture(this.context.TEXTURE_2D, texture)

      // Set the parameters so we can render any size image.
      this.context.texParameteri(
        this.context.TEXTURE_2D,
        this.context.TEXTURE_WRAP_S,
        this.context.CLAMP_TO_EDGE
      )
      this.context.texParameteri(
        this.context.TEXTURE_2D,
        this.context.TEXTURE_WRAP_T,
        this.context.CLAMP_TO_EDGE
      )
      this.context.texParameteri(
        this.context.TEXTURE_2D,
        this.context.TEXTURE_MIN_FILTER,
        this.context.LINEAR
      )
      this.context.texParameteri(
        this.context.TEXTURE_2D,
        this.context.TEXTURE_MAG_FILTER,
        this.context.LINEAR
      )

      // Upload the image into the texture.
      this.context.texImage2D(
        this.context.TEXTURE_2D,
        0,
        this.context.RGBA,
        this.context.RGBA,
        this.context.UNSIGNED_BYTE,
        images[i]
      )
      this.textures.push(texture)

      // lookup the sampler locations.
      const u_imageLocation = this.context.getUniformLocation(
        this.program,
        `u_image${i}`
      )

      // set which texture units to render with.
      this.context.uniform1i(u_imageLocation, i) // texture unit i

      // Set each texture unit to use a particular texture.
      this.context.activeTexture(this.context[`TEXTURE${i}`])
      this.context.bindTexture(this.context.TEXTURE_2D, this.textures[i])
    }
  }

  createScene() {
    this.program = this.context.createProgram()

    this.addShader(this.loadedVertex, this.context.VERTEX_SHADER)
    this.addShader(this.loadedFragment, this.context.FRAGMENT_SHADER)

    this.context.linkProgram(this.program)
    this.context.useProgram(this.program)

    this.uResolution = new Uniform(
      'u_resolution',
      '4f',
      this.program,
      this.context
    )
    this.uTime = new Uniform('u_time', '1f', this.program, this.context)
    this.uRatio = new Uniform('u_pixelRatio', '1f', this.program, this.context)
    this.uThreshold = new Uniform(
      'u_threshold',
      '2f',
      this.program,
      this.context
    )

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

  setSizes() {
    this.windowWidth = window.innerWidth
    this.windowHeight = window.innerHeight
    this.width = this.element.offsetWidth
    this.height = this.element.offsetHeight

    this.canvas.width = this.width * this.ratio
    this.canvas.height = this.height * this.ratio

    let a1: any, a2: any
    if (this.height / this.width < this.imageAspect) {
      a1 = 1
      a2 = this.height / this.width / this.imageAspect
    } else {
      a1 = (this.width / this.height) * this.imageAspect
      a2 = 1
    }

    this.uResolution.set(this.width, this.height, a1, a2)
    this.uRatio.set(1 / this.ratio)
    this.uThreshold.set(0, 0)
    this.context.viewport(
      0,
      0,
      this.width * this.ratio,
      this.height * this.ratio
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
