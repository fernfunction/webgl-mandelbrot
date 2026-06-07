import { PRESETS } from "./presets";
import { MAX_COLORS } from "./shaders";
import { LANGS, getLang, onLangChange, setLang, t } from "./i18n";
import type { Config, Preset } from "./types";
import type { Lang } from "./i18n";
import IconDice from "~icons/mdi/dice-multiple";
import IconReset from "~icons/mdi/image-filter-center-focus";
import IconPlus from "~icons/mdi/plus";
import IconMinus from "~icons/mdi/minus";
import IconClose from "~icons/mdi/close";
import IconMenu from "~icons/mdi/menu";
import FlagUS from "~icons/circle-flags/us";
import FlagBR from "~icons/circle-flags/br";
import FlagES from "~icons/circle-flags/es";

// bandeira (SVG do unplugin) por idioma
const FLAGS: Record<Lang, string> = {
  "en-US": FlagUS,
  "pt-BR": FlagBR,
  es: FlagES,
};

export interface UICallbacks {
  config: Config;
  getPreset(): Preset;
  onPreset(preset: Preset): void;
  onResetView(): void;
  onRandomColors(): void;
  onPixelRatio(): void;
}

// hsv (h 0..360, s/v 0..1) pra string hex
function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s;
  const hp = (h % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0,
    g = 0,
    b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = v - c;
  const hex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

// gera uma paleta nova com a mesma quantidade de cores que ja tem
export function randomPalette(count: number): string[] {
  const base = Math.random() * 360;
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const h = (base + (i / count) * 300 + Math.random() * 20) % 360;
    const s = 0.55 + Math.random() * 0.4;
    const v = 0.4 + (i / Math.max(count - 1, 1)) * 0.6;
    out.push(hsvToHex(h, s, v));
  }
  return out;
}

// monta o painel de controles e liga os elementos aos parametros
export class UI {
  private cb: UICallbacks;
  private presetButtons = new Map<string, HTMLButtonElement>();

  constructor(cb: UICallbacks) {
    this.cb = cb;
    this.build();
    this.setupToggle();
    // trocar de idioma redesenha o painel inteiro com os novos textos
    onLangChange(() => this.rebuild());
  }

  private el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    cls?: string,
    text?: string
  ): HTMLElementTagNameMap[K] {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  // botao com um icone SVG (string do unplugin) seguido do rotulo
  private iconButton(cls: string, icon: string, label: string): HTMLButtonElement {
    const btn = this.el("button", cls) as HTMLButtonElement;
    const ic = this.el("span", "icon");
    ic.innerHTML = icon;
    btn.appendChild(ic);
    btn.appendChild(document.createTextNode(label));
    return btn;
  }

  private section(label: string): HTMLDivElement {
    const sec = this.el("div", "section");
    sec.appendChild(this.el("span", "label", label));
    return sec;
  }

  private build(): void {
    const panel = document.getElementById("panel")!;
    panel.innerHTML = "";

    panel.appendChild(this.el("h2", undefined, t("title")));
    panel.appendChild(this.el("p", "subtitle", t("subtitle")));

    const cfg = this.cb.config;

    // presets
    const presetSec = this.section(t("section.presets"));
    const presetGrid = this.el("div", "grid cols-2");
    this.presetButtons.clear();
    for (const preset of PRESETS) {
      const btn = this.el("button", "preset-btn") as HTMLButtonElement;
      const dot = this.el("span", "dot");
      const cssColor = preset.colors[Math.floor(preset.colors.length / 2)];
      dot.style.color = cssColor;
      dot.style.background = cssColor;
      btn.appendChild(dot);
      btn.appendChild(document.createTextNode(t("preset." + preset.id)));
      btn.addEventListener("click", () => {
        this.cb.onPreset(preset);
        this.rebuild();
      });
      this.presetButtons.set(preset.id, btn);
      presetGrid.appendChild(btn);
    }
    presetSec.appendChild(presetGrid);
    panel.appendChild(presetSec);

    // movimento
    const motionSec = this.section(t("section.motion"));
    motionSec.appendChild(
      this.toggle(t("toggle.autoZoom"), cfg.autoZoom, (on) => {
        cfg.autoZoom = on;
      })
    );
    motionSec.appendChild(
      this.slider(t("slider.zoomSpeed"), cfg.zoomSpeed, 0.05, 1, 0.05, (v) => {
        cfg.zoomSpeed = v;
      })
    );
    panel.appendChild(motionSec);

    // qualidade
    const qualSec = this.section(t("section.quality"));
    qualSec.appendChild(
      this.slider(t("slider.iterations"), cfg.iterations, 50, 2000, 10, (v) => {
        cfg.iterations = v;
      })
    );
    qualSec.appendChild(
      this.slider(t("slider.escape"), cfg.escapeRadius, 4, 1024, 4, (v) => {
        cfg.escapeRadius = v;
      })
    );
    qualSec.appendChild(
      this.slider(t("slider.pixelRatio"), cfg.pixelRatio, 0.5, 2, 0.1, (v) => {
        cfg.pixelRatio = v;
        this.cb.onPixelRatio();
      })
    );
    panel.appendChild(qualSec);

    // cor
    const colorSec = this.section(t("section.color"));
    colorSec.appendChild(
      this.slider(t("slider.colorScale"), cfg.colorScale, 0.1, 5, 0.1, (v) => {
        cfg.colorScale = v;
      })
    );
    colorSec.appendChild(
      this.slider(t("slider.cycleSpeed"), cfg.colorCycleSpeed, 0, 2, 0.05, (v) => {
        cfg.colorCycleSpeed = v;
      })
    );

    colorSec.appendChild(this.el("span", "sub-label", t("color.stops")));
    const stops = this.el("div", "color-list");
    for (let i = 0; i < cfg.colors.length; i++) {
      stops.appendChild(this.colorRow(i));
    }
    colorSec.appendChild(stops);

    const addBtn = this.iconButton("chip add-color", IconPlus, t("color.add"));
    addBtn.disabled = cfg.colors.length >= MAX_COLORS;
    addBtn.addEventListener("click", () => {
      if (cfg.colors.length >= MAX_COLORS) return;
      cfg.colors.push(cfg.colors[cfg.colors.length - 1] ?? "#ffffff");
      this.rebuild();
    });
    colorSec.appendChild(addBtn);

    // cor do miolo
    const interiorRow = this.el("div", "color-row");
    const interiorInput = this.el("input", "color-input") as HTMLInputElement;
    interiorInput.type = "color";
    interiorInput.value = cfg.interior;
    interiorInput.addEventListener("input", () => {
      cfg.interior = interiorInput.value;
    });
    interiorRow.appendChild(interiorInput);
    interiorRow.appendChild(
      this.el("span", "color-name", t("color.interior"))
    );
    colorSec.appendChild(interiorRow);
    panel.appendChild(colorSec);

    // acoes
    const actionSec = this.section(t("section.actions"));
    const actionGrid = this.el("div", "grid cols-2");
    const resetBtn = this.iconButton(
      "action-btn",
      IconReset,
      t("action.resetView")
    );
    resetBtn.addEventListener("click", () => this.cb.onResetView());
    const randomBtn = this.iconButton(
      "action-btn",
      IconDice,
      t("action.randomColors")
    );
    randomBtn.addEventListener("click", () => {
      this.cb.onRandomColors();
      this.rebuild();
    });
    actionGrid.appendChild(resetBtn);
    actionGrid.appendChild(randomBtn);
    actionSec.appendChild(actionGrid);
    panel.appendChild(actionSec);

    // idioma
    const langSec = this.section(t("section.language"));
    const langGrid = this.el("div", "grid cols-3");
    for (const { code, label } of LANGS) {
      const btn = this.iconButton("tool-btn", FLAGS[code], label);
      btn.classList.toggle("active", code === getLang());
      btn.addEventListener("click", () => setLang(code));
      langGrid.appendChild(btn);
    }
    langSec.appendChild(langGrid);
    panel.appendChild(langSec);

    // dica
    const hint = this.el("p", "hint");
    hint.innerHTML = t("hint", {
      menu: `<span class="icon icon-inline">${IconMenu}</span>`,
    });
    panel.appendChild(hint);

    // botao X que recolhe o painel; recriado aqui porque o build limpa o painel
    const collapse = this.el("button", "collapse-btn") as HTMLButtonElement;
    collapse.innerHTML = `<span class="icon">${IconClose}</span>`;
    collapse.setAttribute("aria-label", t("aria.collapsePanel"));
    collapse.addEventListener("click", () =>
      document.body.classList.add("panel-hidden")
    );
    panel.appendChild(collapse);

    document
      .getElementById("toggle-panel")
      ?.setAttribute("aria-label", t("aria.togglePanel"));

    this.refreshPresetButtons();
  }

  // uma linha da paleta: o seletor de cor e um botao pra remover
  private colorRow(i: number): HTMLDivElement {
    const cfg = this.cb.config;
    const row = this.el("div", "color-row");
    const input = this.el("input", "color-input") as HTMLInputElement;
    input.type = "color";
    input.value = cfg.colors[i];
    input.addEventListener("input", () => {
      cfg.colors[i] = input.value;
    });
    row.appendChild(input);
    row.appendChild(this.el("span", "color-name", `#${i + 1}`));

    const remove = this.el("button", "icon-btn") as HTMLButtonElement;
    remove.innerHTML = `<span class="icon">${IconMinus}</span>`;
    remove.setAttribute("aria-label", t("aria.removeColor"));
    remove.disabled = cfg.colors.length <= 2;
    remove.addEventListener("click", () => {
      if (cfg.colors.length <= 2) return;
      cfg.colors.splice(i, 1);
      this.rebuild();
    });
    row.appendChild(remove);
    return row;
  }

  private slider(
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (v: number) => void
  ): HTMLDivElement {
    const wrap = this.el("div", "slider");
    const row = this.el("div", "row");
    row.appendChild(this.el("span", undefined, label));
    const val = this.el("span", "val", this.fmt(value, step));
    row.appendChild(val);
    const input = this.el("input") as HTMLInputElement;
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(value);
    input.addEventListener("input", () => {
      const v = parseFloat(input.value);
      val.textContent = this.fmt(v, step);
      onChange(v);
    });
    wrap.appendChild(row);
    wrap.appendChild(input);
    return wrap;
  }

  private fmt(v: number, step: number): string {
    if (step >= 1) return String(Math.round(v));
    if (step >= 0.1) return v.toFixed(1);
    return v.toFixed(2);
  }

  private toggle(
    label: string,
    initial: boolean,
    onChange: (on: boolean) => void
  ): HTMLDivElement {
    const wrap = this.el("div", "toggle" + (initial ? " on" : ""));
    wrap.appendChild(this.el("span", undefined, label));
    wrap.appendChild(this.el("span", "switch"));
    wrap.addEventListener("click", () => {
      const on = !wrap.classList.contains("on");
      wrap.classList.toggle("on", on);
      onChange(on);
    });
    return wrap;
  }

  private refreshPresetButtons(): void {
    const current = this.cb.getPreset().id;
    for (const [id, btn] of this.presetButtons)
      btn.classList.toggle("active", id === current);
  }

  // redesenha o painel (troca de preset, idioma ou edicao da paleta)
  rebuild(): void {
    this.build();
  }

  private setupToggle(): void {
    const btn = document.getElementById("toggle-panel")!;
    btn.innerHTML = `<span class="icon">${IconMenu}</span>`;
    btn.addEventListener("click", () =>
      document.body.classList.remove("panel-hidden")
    );
  }
}
