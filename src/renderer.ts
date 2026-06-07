import { Blitter, Program } from "./gl-utils";
import type { GLContext } from "./gl-utils";
import { hexToRgb } from "./presets";
import { baseVertexShader, mandelbrotShader, MAX_COLORS } from "./shaders";
import type { Config, View } from "./types";

// quebra um double em duas partes float (alto + resto) pro shader double-single
function split(x: number): [number, number] {
  const hi = Math.fround(x);
  return [hi, x - hi];
}

// desenha o conjunto: monta os uniforms a partir da view e da config e blita
export class MandelbrotRenderer {
  private gl: WebGL2RenderingContext;
  private program: Program;
  private blitter: Blitter;
  // offset de cor acumulado (animacao da paleta)
  colorOffset = 0;

  constructor(glx: GLContext) {
    this.gl = glx.gl;
    this.program = new Program(this.gl, baseVertexShader, mandelbrotShader);
    this.blitter = new Blitter(this.gl);
  }

  render(view: View, config: Config): void {
    const gl = this.gl;
    const u = this.program.uniforms;
    this.program.bind();

    const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
    const [cxHi, cxLo] = split(view.centerX);
    const [cyHi, cyLo] = split(view.centerY);
    const [sHi, sLo] = split(view.scale);

    gl.uniform2f(u.uCenterX, cxHi, cxLo);
    gl.uniform2f(u.uCenterY, cyHi, cyLo);
    gl.uniform2f(u.uScale, sHi, sLo);
    gl.uniform1f(u.uAspect, aspect);
    gl.uniform1i(u.uIterations, Math.round(config.iterations));
    gl.uniform1f(u.uEscape2, config.escapeRadius * config.escapeRadius);
    gl.uniform1f(u.uColorScale, config.colorScale);
    gl.uniform1f(u.uColorOffset, this.colorOffset);

    // empacota as cores num Float32Array de tamanho fixo (o teto do shader)
    const count = Math.min(config.colors.length, MAX_COLORS);
    const flat = new Float32Array(MAX_COLORS * 3);
    for (let i = 0; i < count; i++) {
      const [r, g, b] = hexToRgb(config.colors[i]);
      flat[i * 3] = r;
      flat[i * 3 + 1] = g;
      flat[i * 3 + 2] = b;
    }
    gl.uniform3fv(u.uColors, flat);
    gl.uniform1i(u.uColorCount, Math.max(count, 1));

    const [ir, ig, ib] = hexToRgb(config.interior);
    gl.uniform3f(u.uInterior, ir, ig, ib);

    this.blitter.blit();
  }
}
