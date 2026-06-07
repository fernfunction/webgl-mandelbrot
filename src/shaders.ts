// shaders GLSL ES 3.00 como template strings
// a conta do z = z^2 + c roda em precisao dupla emulada (double-single) pra
// aguentar zoom bem profundo sem a imagem virar bloco

// teto de cores que o shader aceita; a UI nao deixa passar disso
export const MAX_COLORS = 8;
// teto absoluto de iteracoes do loop (o uniform corta antes na pratica)
const MAX_ITER = 2000;

export const baseVertexShader = /* glsl */ `#version 300 es
precision highp float;
in vec2 aPosition;
out vec2 vUv;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

export const mandelbrotShader = /* glsl */ `#version 300 es
precision highp float;
precision highp int;
in vec2 vUv;
out vec4 fragColor;

uniform vec2 uCenterX;   // centro real em double-single (alto, baixo)
uniform vec2 uCenterY;   // centro imaginario em double-single
uniform vec2 uScale;     // altura da janela no plano, em double-single
uniform float uAspect;   // largura / altura
uniform int uIterations; // teto de iteracoes
uniform float uEscape2;  // raio de escape ao quadrado
uniform float uColorScale;
uniform float uColorOffset;
uniform int uColorCount;
uniform vec3 uColors[${MAX_COLORS}];
uniform vec3 uInterior;

const int MAX_ITER = ${MAX_ITER};

// cada numero vira vec2: parte alta + erro residual que sobra dela
vec2 dsAdd(vec2 a, vec2 b){
  float t1 = a.x + b.x;
  float e = t1 - a.x;
  float t2 = ((b.x - e) + (a.x - (t1 - e))) + a.y + b.y;
  float hi = t1 + t2;
  return vec2(hi, t2 - (hi - t1));
}
vec2 dsMul(vec2 a, vec2 b){
  float split = 4097.0;
  float cona = a.x * split;
  float conb = b.x * split;
  float a1 = cona - (cona - a.x);
  float b1 = conb - (conb - b.x);
  float a2 = a.x - a1;
  float b2 = b.x - b1;
  float c11 = a.x * b.x;
  float c21 = a2 * b2 + (a2 * b1 + (a1 * b2 + (a1 * b1 - c11)));
  float c2 = a.x * b.y + a.y * b.x;
  float t1 = c11 + c2;
  float e = t1 - c11;
  float t2 = a.y * b.y + ((c2 - e) + (c11 - (t1 - e))) + c21;
  float hi = t1 + t2;
  return vec2(hi, t2 - (hi - t1));
}
vec2 dsSet(float a){ return vec2(a, 0.0); }

// pega a cor t (0..1) interpolando entre as N cores, voltando do fim pro comeco
vec3 palette(float t){
  int n = uColorCount;
  float scaled = fract(t) * float(n);
  int idx = int(floor(scaled));
  float f = scaled - float(idx);
  int i0 = idx % n;
  int i1 = (idx + 1) % n;
  vec3 c0 = uColors[0];
  vec3 c1 = uColors[0];
  // indice dinamico em array de uniform e meio sensivel, entao varremos no loop
  for (int k = 0; k < ${MAX_COLORS}; k++){
    if (k == i0) c0 = uColors[k];
    if (k == i1) c1 = uColors[k];
  }
  return mix(c0, c1, smoothstep(0.0, 1.0, f));
}

void main(){
  // deslocamento do pixel em relacao ao centro, em fracao da janela
  float ox = (vUv.x - 0.5) * uAspect;
  float oy = (vUv.y - 0.5);
  vec2 cr = dsAdd(uCenterX, dsMul(dsSet(ox), uScale));
  vec2 ci = dsAdd(uCenterY, dsMul(dsSet(oy), uScale));

  vec2 zr = dsSet(0.0);
  vec2 zi = dsSet(0.0);
  int iter = 0;
  float mag = 0.0;
  for (int i = 0; i < MAX_ITER; i++){
    if (i >= uIterations) break;
    vec2 zr2 = dsMul(zr, zr);
    vec2 zi2 = dsMul(zi, zi);
    mag = zr2.x + zi2.x;
    if (mag > uEscape2) break;
    // zi = 2*zr*zi + ci ; zr = zr2 - zi2 + cr
    vec2 zrzi = dsMul(zr, zi);
    zi = dsAdd(dsAdd(zrzi, zrzi), ci);
    zr = dsAdd(dsAdd(zr2, vec2(-zi2.x, -zi2.y)), cr);
    iter++;
  }

  if (iter >= uIterations){
    fragColor = vec4(uInterior, 1.0);
    return;
  }

  // suavizacao do contorno pra cor nao sair em degraus
  float m = sqrt(max(mag, 1.0001));
  float mu = float(iter) + 1.0 - log(log(m)) / log(2.0);
  float t = mu * uColorScale * 0.02 + uColorOffset;
  fragColor = vec4(palette(t), 1.0);
}`;
