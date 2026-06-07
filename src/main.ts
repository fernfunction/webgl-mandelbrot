import "./style.css";
import { applyPreset, defaultConfig, viewFromPreset } from "./config";
import { createGLContext, GLInitError } from "./gl-utils";
import { t } from "./i18n";
import { InputManager } from "./input";
import { getPreset } from "./presets";
import { MandelbrotRenderer } from "./renderer";
import type { Preset, View } from "./types";
import { randomPalette, UI } from "./ui";

function showUnsupported(message: string): void {
  const el = document.getElementById("unsupported")!;
  const title = document.querySelector<HTMLHeadingElement>("#unsupported h1")!;
  const msg = document.getElementById("unsupported-msg")!;
  title.textContent = t("unsupported.title");
  msg.textContent = message;
  el.hidden = false;
}

function boot(): void {
  try {
    bootInner();
  } catch (err) {
    console.error("Erro fatal na inicializacao:", err);
    showUnsupported(
      t("error.initFailed", { msg: (err as Error)?.message ?? String(err) })
    );
  }
}

function bootInner(): void {
  const canvas = document.getElementById("view") as HTMLCanvasElement;

  let glx;
  try {
    glx = createGLContext(canvas);
  } catch (err) {
    if (err instanceof GLInitError) showUnsupported(err.message);
    else
      showUnsupported(t("error.unexpected", { msg: (err as Error).message }));
    return;
  }

  const config = defaultConfig();
  let currentPreset: Preset = getPreset("classic");
  const view: View = viewFromPreset(currentPreset);

  const renderer = new MandelbrotRenderer(glx);
  new InputManager(canvas, view);

  // o backing store do canvas leva em conta o dpr e o multiplicador de resolucao
  function resizeCanvas(): void {
    const ratio = Math.min(window.devicePixelRatio || 1, 2) * config.pixelRatio;
    const w = Math.max(1, Math.floor(canvas.clientWidth * ratio));
    const h = Math.max(1, Math.floor(canvas.clientHeight * ratio));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  new UI({
    config,
    getPreset: () => currentPreset,
    onPreset: (preset) => {
      currentPreset = preset;
      applyPreset(config, preset);
      const v = viewFromPreset(preset);
      view.centerX = v.centerX;
      view.centerY = v.centerY;
      view.scale = v.scale;
    },
    onResetView: () => {
      const v = viewFromPreset(currentPreset);
      view.centerX = v.centerX;
      view.centerY = v.centerY;
      view.scale = v.scale;
    },
    onRandomColors: () => {
      config.colors = randomPalette(config.colors.length);
    },
    onPixelRatio: () => resizeCanvas(),
  });

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // rodape: span dinamico (fps/preset/zoom) + credito estatico com link
  const fpsEl = document.getElementById("fps")!;
  const fpsStat = document.createElement("span");
  const credit = document.createElement("span");
  credit.className = "credit";
  credit.append(" · Davi Viana @");
  const creditLink = document.createElement("a");
  creditLink.href = "https://github.com/fernfunction";
  creditLink.target = "_blank";
  creditLink.rel = "noopener noreferrer";
  creditLink.textContent = "fernfunction";
  credit.append(creditLink);
  fpsEl.append(fpsStat, credit);

  // mostra o quanto ja aproximou (a janela cheia do classico tem altura 3)
  function formatZoom(): string {
    const factor = 3 / view.scale;
    if (factor < 1000) return factor.toFixed(factor < 10 ? 1 : 0);
    return factor.toExponential(1);
  }

  let lastTime = performance.now();
  let fpsAccum = 0;
  let fpsFrames = 0;
  let fpsTimer = 0;

  function frame(now: number): void {
    let dt = (now - lastTime) / 1000;
    lastTime = now;
    dt = Math.min(dt, 1 / 30);

    // zoom automatico: a altura da janela encolhe de forma exponencial
    if (config.autoZoom) {
      const next = view.scale * Math.exp(-config.zoomSpeed * dt);
      view.scale = Math.max(1e-13, next);
    }
    // animacao da paleta
    renderer.colorOffset += config.colorCycleSpeed * dt * 0.1;

    renderer.render(view, config);

    fpsAccum += dt;
    fpsFrames++;
    fpsTimer += dt;
    if (fpsTimer >= 0.5) {
      const fps = fpsFrames / fpsAccum;
      fpsStat.textContent = t("fps", {
        fps: Math.round(fps),
        preset: t("preset." + currentPreset.id),
        zoom: formatZoom(),
      });
      fpsAccum = 0;
      fpsFrames = 0;
      fpsTimer = 0;
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

boot();
