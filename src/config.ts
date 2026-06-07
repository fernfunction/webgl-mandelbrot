import { getPreset } from "./presets";
import type { Config, Preset, View } from "./types";

// config inicial: nasce do preset classico
export function defaultConfig(): Config {
  const p = getPreset("classic");
  return {
    iterations: p.iterations,
    escapeRadius: p.escapeRadius,
    colorScale: p.colorScale,
    colorCycleSpeed: p.colorCycleSpeed,
    zoomSpeed: p.zoomSpeed,
    pixelRatio: 1.0,
    autoZoom: false,
    colors: [...p.colors],
    interior: p.interior,
  };
}

// joga os parametros do preset na config; nao mexe no pixelRatio nem no autoZoom,
// que sao preferencias do usuario
export function applyPreset(config: Config, preset: Preset): void {
  config.iterations = preset.iterations;
  config.escapeRadius = preset.escapeRadius;
  config.colorScale = preset.colorScale;
  config.colorCycleSpeed = preset.colorCycleSpeed;
  config.zoomSpeed = preset.zoomSpeed;
  config.colors = [...preset.colors];
  config.interior = preset.interior;
}

// leva a janela pro lugar do preset
export function viewFromPreset(preset: Preset): View {
  return {
    centerX: preset.centerX,
    centerY: preset.centerY,
    scale: preset.scale,
  };
}
