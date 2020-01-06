import { gsap, Elastic, Power2 } from "gsap";

export class Uniform {
  name: any;
  suffix: any;
  gl: any;
  program: any;
  location: any;

  constructor(name, suffix, program, gl) {
    this.name = name;
    this.suffix = suffix;
    this.gl = gl;
    this.program = program;
    this.location = gl.getUniformLocation(program, name);
  }

  set(...values) {
    let method = "uniform" + this.suffix;
    let args = [this.location].concat(values);
    this.gl[method].apply(this.gl, args);
  }
}

export class EasingUniform {
  name: any;
  suffix: any;
  gl: any;
  program: any;
  location: any;
  state: any;
  lastCallback: any;

  constructor(name, suffix, program, gl) {
    this.name = name;
    this.suffix = suffix;
    this.gl = gl;
    this.program = program;
    this.location = gl.getUniformLocation(program, name);
    this.state = {};
  }

  set(value, opts: { delay?: number } = {}) {
    if (this.lastCallback) this.lastCallback.kill();
    this.lastCallback = gsap.to(this, this.state > value ? 2 : 4, {
      state: value,
      ease: this.state > value ? Power2.easeInOut : Elastic.easeOut,
      onUpdate: () => {
        this.gl["uniform" + this.suffix].apply(
          this.gl,
          [this.location].concat(this.state)
        );
      },
      ...opts
    });
  }
}

export class Rect {
  verts: Float32Array;

  constructor(gl: any) {
    this.verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.verts, gl.STATIC_DRAW);
  }

  render(gl: any) {
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
