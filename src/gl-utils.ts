import { t } from "./i18n";

// o contexto WebGL2; o mandelbrot renderiza direto no canvas, sem FBOs
export interface GLContext {
  gl: WebGL2RenderingContext;
}

export class GLInitError extends Error {}

// cria o contexto WebGL2; estoura com mensagem amigavel se nao rolar
export function createGLContext(canvas: HTMLCanvasElement): GLContext {
  const params: WebGLContextAttributes = {
    alpha: false,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false,
    powerPreference: "high-performance",
  };

  const gl = canvas.getContext("webgl2", params);
  if (!gl) {
    throw new GLInitError(t("error.webgl2"));
  }

  gl.disable(gl.BLEND);
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);

  return { gl };
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Falha ao criar shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error("Erro ao compilar shader:\n" + log + "\n\n" + source);
  }
  return shader;
}

export type Uniforms = Record<string, WebGLUniformLocation | null>;

// programa ja compilado, com as localizacoes de uniform em cache
export class Program {
  readonly program: WebGLProgram;
  readonly uniforms: Uniforms = {};
  private gl: WebGL2RenderingContext;

  constructor(gl: WebGL2RenderingContext, vsSource: string, fsSource: string) {
    this.gl = gl;
    const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    if (!program) throw new Error("Falha ao criar programa");
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    // prende o atributo de posicao na location 0 pra um VAO so servir pra tudo
    gl.bindAttribLocation(program, 0, "aPosition");
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program);
      throw new Error("Erro ao linkar programa:\n" + log);
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    this.program = program;

    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(program, i);
      if (!info) continue;
      const name = info.name.replace(/\[0\]$/, "");
      this.uniforms[name] = gl.getUniformLocation(program, name);
    }
  }

  bind(): void {
    this.gl.useProgram(this.program);
  }
}

// quad de tela cheia + VAO que o passe de render usa
export class Blitter {
  private gl: WebGL2RenderingContext;
  private vao: WebGLVertexArrayObject;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    const vao = gl.createVertexArray();
    if (!vao) throw new Error("Falha ao criar VAO");
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
      gl.STATIC_DRAW
    );
    const ebo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array([0, 1, 2, 0, 2, 3]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this.vao = vao;
  }

  // desenha o quad direto no canvas
  blit(): void {
    const gl = this.gl;
    gl.bindVertexArray(this.vao);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }
}
