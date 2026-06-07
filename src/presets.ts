import type { Preset } from "./types";

// converte hex (#rrggbb) pra RGB 0..1 pro shader
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  return [r, g, b];
}

// cada preset aponta pra um lugar conhecido do conjunto e traz a propria paleta;
// quanto menor o scale, mais fundo ja comeca o passeio
export const PRESETS: Preset[] = [
  {
    id: "classic",
    centerX: -0.5,
    centerY: 0.0,
    scale: 3.0,
    iterations: 200,
    escapeRadius: 256,
    colorScale: 1.0,
    colorCycleSpeed: 0.0,
    zoomSpeed: 0.25,
    colors: ["#0b1d51", "#3a86ff", "#caf0f8", "#ffd166", "#073b4c"],
    interior: "#05060a",
  },
  {
    id: "seahorse",
    centerX: -0.743643887037151,
    centerY: 0.13182590420533,
    scale: 0.0009,
    iterations: 600,
    escapeRadius: 256,
    colorScale: 1.4,
    colorCycleSpeed: 0.0,
    zoomSpeed: 0.35,
    colors: ["#03045e", "#0077b6", "#00b4d8", "#90e0ef", "#caf0f8"],
    interior: "#04060f",
  },
  {
    id: "elephant",
    centerX: 0.2925755,
    centerY: 0.0149977,
    scale: 0.03,
    iterations: 400,
    escapeRadius: 256,
    colorScale: 1.1,
    colorCycleSpeed: 0.0,
    zoomSpeed: 0.3,
    colors: ["#03071e", "#6a040f", "#dc2f02", "#f48c06", "#ffba08"],
    interior: "#0a0400",
  },
  {
    id: "spiral",
    centerX: -0.7269,
    centerY: 0.1889,
    scale: 0.008,
    iterations: 500,
    escapeRadius: 256,
    colorScale: 1.3,
    colorCycleSpeed: 0.0,
    zoomSpeed: 0.35,
    colors: ["#240046", "#5a189a", "#9d4edd", "#e0aaff", "#ff5d8f"],
    interior: "#08010f",
  },
  {
    id: "dendrite",
    centerX: -0.235125,
    centerY: 0.827215,
    scale: 0.03,
    iterations: 450,
    escapeRadius: 256,
    colorScale: 1.2,
    colorCycleSpeed: 0.0,
    zoomSpeed: 0.3,
    colors: ["#012a4a", "#2a6f97", "#61a5c2", "#a9d6e5", "#ffffff"],
    interior: "#020812",
  },
  {
    id: "minibrot",
    centerX: -1.7497591451303665,
    centerY: 0.0,
    scale: 0.0008,
    iterations: 700,
    escapeRadius: 256,
    colorScale: 1.5,
    colorCycleSpeed: 0.0,
    zoomSpeed: 0.4,
    colors: ["#1a1423", "#774936", "#b58463", "#f2e9e4", "#3d2c2e"],
    interior: "#050307",
  },
  {
    id: "flames",
    centerX: -0.10109636384562,
    centerY: 0.95628651080914,
    scale: 0.006,
    iterations: 550,
    escapeRadius: 256,
    colorScale: 1.3,
    colorCycleSpeed: 0.0,
    zoomSpeed: 0.35,
    colors: ["#10002b", "#e85d04", "#faa307", "#ffba08", "#ffffff"],
    interior: "#0a0200",
  },
  {
    id: "triple",
    centerX: -0.088,
    centerY: 0.654,
    scale: 0.03,
    iterations: 450,
    escapeRadius: 256,
    colorScale: 1.2,
    colorCycleSpeed: 0.0,
    zoomSpeed: 0.3,
    colors: ["#10002b", "#7b2cbf", "#c77dff", "#e0aaff", "#ff7096"],
    interior: "#06010f",
  },
];

export function getPreset(id: string): Preset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}
