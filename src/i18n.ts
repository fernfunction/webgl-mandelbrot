// i18n simples e sem dependencia: dicionarios por idioma, t() com interpolacao
// de {placeholders} e um observer pra UI se redesenhar quando o idioma muda

export type Lang = "en-US" | "pt-BR" | "es";

export const LANGS: { code: Lang; label: string }[] = [
  { code: "en-US", label: "EN" },
  { code: "pt-BR", label: "PT" },
  { code: "es", label: "ES" },
];

type Dict = Record<string, string>;

const messages: Record<Lang, Dict> = {
  "en-US": {
    title: "Mandelbrot Sandbox",
    subtitle: "Infinite fractal zoom · WebGL2",
    "section.presets": "Presets",
    "section.motion": "Motion",
    "section.quality": "Quality",
    "section.color": "Color",
    "section.actions": "Actions",
    "section.language": "Language",
    "toggle.autoZoom": "Auto zoom",
    "slider.zoomSpeed": "Zoom speed",
    "slider.iterations": "Iterations",
    "slider.escape": "Escape radius",
    "slider.pixelRatio": "Resolution",
    "slider.colorScale": "Band density",
    "slider.cycleSpeed": "Color cycle",
    "color.stops": "Palette colors",
    "color.add": "Add color",
    "color.interior": "Inside color",
    "action.resetView": "Reset view",
    "action.randomColors": "Random colors",
    hint: "Drag to pan, scroll to zoom, double click to recenter. Turn on Auto zoom to dive in forever; raise Iterations and Resolution if your GPU can take it. Add or remove palette colors to repaint the set. {menu} shows the panel.",
    "aria.togglePanel": "Show/hide controls",
    "aria.collapsePanel": "Collapse panel",
    "aria.removeColor": "Remove color",
    "unsupported.title": "Oops, incompatible GPU",
    "preset.classic": "Classic",
    "preset.seahorse": "Seahorse",
    "preset.elephant": "Elephants",
    "preset.spiral": "Spiral",
    "preset.dendrite": "Dendrite",
    "preset.minibrot": "Minibrot",
    "preset.flames": "Flames",
    "preset.triple": "Triple spiral",
    "error.webgl2":
      "Your browser doesn't support WebGL2, which the sandbox needs. Try an up-to-date browser (recent Chrome, Edge, Firefox or Safari).",
    "error.initFailed": "Error starting the sandbox: {msg}",
    "error.unexpected": "Unexpected failure starting WebGL: {msg}",
    fps: "{fps} FPS · {preset} · {zoom}x",
  },
  "pt-BR": {
    title: "Mandelbrot Sandbox",
    subtitle: "Zoom fractal infinito · WebGL2",
    "section.presets": "Presets",
    "section.motion": "Movimento",
    "section.quality": "Qualidade",
    "section.color": "Cor",
    "section.actions": "Ações",
    "section.language": "Idioma",
    "toggle.autoZoom": "Zoom automático",
    "slider.zoomSpeed": "Velocidade do zoom",
    "slider.iterations": "Iterações",
    "slider.escape": "Raio de escape",
    "slider.pixelRatio": "Resolução",
    "slider.colorScale": "Densidade das faixas",
    "slider.cycleSpeed": "Ciclo de cor",
    "color.stops": "Cores da paleta",
    "color.add": "Adicionar cor",
    "color.interior": "Cor do miolo",
    "action.resetView": "Resetar visão",
    "action.randomColors": "Cores aleatórias",
    hint: "Arraste para mover, use a roda para dar zoom e o duplo clique para recentralizar. Ligue o Zoom automático para mergulhar sem parar; suba as Iterações e a Resolução se a sua GPU aguentar. Adicione ou remova cores da paleta para repintar o conjunto. {menu} exibe o painel.",
    "aria.togglePanel": "Mostrar/ocultar controles",
    "aria.collapsePanel": "Recolher painel",
    "aria.removeColor": "Remover cor",
    "unsupported.title": "Ops, GPU incompatível",
    "preset.classic": "Clássico",
    "preset.seahorse": "Cavalo-marinho",
    "preset.elephant": "Elefantes",
    "preset.spiral": "Espiral",
    "preset.dendrite": "Dendrito",
    "preset.minibrot": "Minibrot",
    "preset.flames": "Chamas",
    "preset.triple": "Espiral tripla",
    "error.webgl2":
      "Seu navegador não suporta WebGL2, necessário para a sandbox. Tente um navegador atualizado (Chrome, Edge, Firefox ou Safari recentes).",
    "error.initFailed": "Erro ao iniciar a sandbox: {msg}",
    "error.unexpected": "Falha inesperada ao iniciar o WebGL: {msg}",
    fps: "{fps} FPS · {preset} · {zoom}x",
  },
  es: {
    title: "Mandelbrot Sandbox",
    subtitle: "Zoom fractal infinito · WebGL2",
    "section.presets": "Presets",
    "section.motion": "Movimiento",
    "section.quality": "Calidad",
    "section.color": "Color",
    "section.actions": "Acciones",
    "section.language": "Idioma",
    "toggle.autoZoom": "Zoom automático",
    "slider.zoomSpeed": "Velocidad del zoom",
    "slider.iterations": "Iteraciones",
    "slider.escape": "Radio de escape",
    "slider.pixelRatio": "Resolución",
    "slider.colorScale": "Densidad de bandas",
    "slider.cycleSpeed": "Ciclo de color",
    "color.stops": "Colores de la paleta",
    "color.add": "Añadir color",
    "color.interior": "Color del interior",
    "action.resetView": "Reiniciar vista",
    "action.randomColors": "Colores aleatorios",
    hint: "Arrastra para mover, usa la rueda para el zoom y el doble clic para recentrar. Activa el Zoom automático para sumergirte sin fin; sube las Iteraciones y la Resolución si tu GPU lo aguanta. Añade o quita colores de la paleta para repintar el conjunto. {menu} muestra el panel.",
    "aria.togglePanel": "Mostrar/ocultar controles",
    "aria.collapsePanel": "Ocultar panel",
    "aria.removeColor": "Quitar color",
    "unsupported.title": "Ups, GPU incompatible",
    "preset.classic": "Clásico",
    "preset.seahorse": "Caballito",
    "preset.elephant": "Elefantes",
    "preset.spiral": "Espiral",
    "preset.dendrite": "Dendrita",
    "preset.minibrot": "Minibrot",
    "preset.flames": "Llamas",
    "preset.triple": "Espiral triple",
    "error.webgl2":
      "Tu navegador no soporta WebGL2, necesario para la sandbox. Prueba con un navegador actualizado (Chrome, Edge, Firefox o Safari recientes).",
    "error.initFailed": "Error al iniciar la sandbox: {msg}",
    "error.unexpected": "Fallo inesperado al iniciar WebGL: {msg}",
    fps: "{fps} FPS · {preset} · {zoom}x",
  },
};

const DEFAULT_LANG: Lang = "en-US";
const listeners = new Set<() => void>();
let current: Lang = initialLang();
document.documentElement.lang = current;

// preferencia salva tem prioridade; senao herda o idioma do sistema; senao en-US
function initialLang(): Lang {
  try {
    const saved = localStorage.getItem("lang");
    if (saved && saved in messages) return saved as Lang;
  } catch {
    // localStorage pode estar bloqueado; segue para o idioma do sistema
  }
  return systemLang() ?? DEFAULT_LANG;
}

function systemLang(): Lang | null {
  const prefs = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  for (const pref of prefs) {
    if (!pref) continue;
    if (pref in messages) return pref as Lang;
    const base = pref.split("-")[0].toLowerCase();
    const match = (Object.keys(messages) as Lang[]).find(
      (code) => code.split("-")[0].toLowerCase() === base
    );
    if (match) return match;
  }
  return null;
}

export function getLang(): Lang {
  return current;
}

export function setLang(lang: Lang): void {
  if (lang === current || !(lang in messages)) return;
  current = lang;
  try {
    localStorage.setItem("lang", lang);
  } catch {
    // sem persistencia, mas a troca em runtime ainda vale
  }
  document.documentElement.lang = lang;
  for (const cb of listeners) cb();
}

// registra um callback pra rodar a cada troca de idioma (ex.: redesenhar a UI)
export function onLangChange(cb: () => void): void {
  listeners.add(cb);
}

// traduz uma chave no idioma atual, com fallback pro en-US e interpolacao
export function t(key: string, params?: Record<string, string | number>): string {
  let s = messages[current][key] ?? messages["en-US"][key] ?? key;
  if (params) {
    for (const k in params) s = s.replace(`{${k}}`, String(params[k]));
  }
  return s;
}
