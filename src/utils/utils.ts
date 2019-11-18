export class Uniform {
  name: any
  suffix: any
  gl: any
  program: any
  location: any

  constructor(name, suffix, program, gl) {
    this.name = name
    this.suffix = suffix
    this.gl = gl
    this.program = program
    this.location = gl.getUniformLocation(program, name)
  }

  set(...values) {
    let method = 'uniform' + this.suffix
    let args = [this.location].concat(values)
    this.gl[method].apply(this.gl, args)
  }
}

export class Rect {
  verts: Float32Array

  constructor(gl: any) {
    this.verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    var buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.verts, gl.STATIC_DRAW)
  }

  render(gl: any) {
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
}
