// um preset junta um lugar interessante do conjunto com uma paleta e os
// parametros de geracao; o nome exibido vem do i18n pelo id
export interface Preset {
  id: string;
  // centro da janela no plano complexo
  centerX: number;
  centerY: number;
  // altura total da janela no plano complexo (quanto menor, mais perto)
  scale: number;
  // teto de iteracoes por pixel
  iterations: number;
  // raio de escape (modulo de z em que paramos)
  escapeRadius: number;
  // densidade das faixas de cor
  colorScale: number;
  // velocidade da animacao da paleta (0 deixa parada)
  colorCycleSpeed: number;
  // velocidade do zoom automatico (fracao por segundo)
  zoomSpeed: number;
  // as N cores que se repetem ao longo do contorno (hex)
  colors: string[];
  // cor de quem fica preso no conjunto (o miolo)
  interior: string;
}

// parametros que mudam em runtime: presets preenchem, controles ajustam
export interface Config {
  iterations: number;
  escapeRadius: number;
  colorScale: number;
  colorCycleSpeed: number;
  zoomSpeed: number;
  // multiplicador de resolucao do render (mais hardware aguenta mais)
  pixelRatio: number;
  // zoom automatico ligado
  autoZoom: boolean;
  // a paleta editavel pelo usuario
  colors: string[];
  interior: string;
}

// onde a janela esta olhando agora; separado da config porque muda sozinho
export interface View {
  centerX: number;
  centerY: number;
  scale: number;
}
