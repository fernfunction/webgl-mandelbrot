import type { View } from "./types";

// limites de zoom: o piso e ate onde a precisao dupla emulada ainda segura
const MIN_SCALE = 1e-13;
const MAX_SCALE = 6;

interface TouchInfo {
  x: number;
  y: number;
}

// liga mouse e toque pra navegar pelo conjunto: arrastar move, roda/pinca da
// zoom e o duplo clique recentraliza; mexe direto na view
export class InputManager {
  private canvas: HTMLCanvasElement;
  private view: View;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private touches = new Map<number, TouchInfo>();

  constructor(canvas: HTMLCanvasElement, view: View) {
    this.canvas = canvas;
    this.view = view;
    this.attach();
  }

  private aspect(): number {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  // quanto de plano complexo cabe em um pixel
  private cpp(): number {
    return this.view.scale / this.canvas.clientHeight;
  }

  private pan(dxPixels: number, dyPixels: number): void {
    const cpp = this.cpp();
    this.view.centerX -= dxPixels * cpp;
    this.view.centerY += dyPixels * cpp;
  }

  // zoom mantendo fixo o ponto do plano que esta embaixo do cursor
  private zoomAt(clientX: number, clientY: number, factor: number): void {
    const rect = this.canvas.getBoundingClientRect();
    const px = (clientX - rect.left) / rect.width;
    const py = (clientY - rect.top) / rect.height;
    const offsetX = (px - 0.5) * this.aspect();
    const offsetY = 0.5 - py;
    const scale = this.view.scale;
    const targetX = this.view.centerX + offsetX * scale;
    const targetY = this.view.centerY + offsetY * scale;
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * factor));
    this.view.scale = next;
    this.view.centerX = targetX - offsetX * next;
    this.view.centerY = targetY - offsetY * next;
  }

  private recenter(clientX: number, clientY: number): void {
    const rect = this.canvas.getBoundingClientRect();
    const px = (clientX - rect.left) / rect.width;
    const py = (clientY - rect.top) / rect.height;
    const offsetX = (px - 0.5) * this.aspect();
    const offsetY = 0.5 - py;
    this.view.centerX += offsetX * this.view.scale;
    this.view.centerY += offsetY * this.view.scale;
  }

  private attach(): void {
    const c = this.canvas;
    const target = window;

    // mouse
    c.addEventListener("mousedown", (e) => {
      this.dragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });
    target.addEventListener("mousemove", (e) => {
      if (!this.dragging) return;
      this.pan(e.clientX - this.lastX, e.clientY - this.lastY);
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });
    target.addEventListener("mouseup", () => {
      this.dragging = false;
    });
    c.addEventListener("dblclick", (e) => {
      e.preventDefault();
      this.recenter(e.clientX, e.clientY);
    });

    // roda do mouse: pra cima aproxima, pra baixo afasta
    c.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const factor = Math.exp(e.deltaY * 0.001);
        this.zoomAt(e.clientX, e.clientY, factor);
      },
      { passive: false }
    );

    // toque
    c.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        for (const t of Array.from(e.changedTouches)) {
          this.touches.set(t.identifier, { x: t.clientX, y: t.clientY });
        }
      },
      { passive: false }
    );
    c.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        const ids = Array.from(this.touches.keys());
        if (ids.length === 1) {
          // um dedo so: arrasta
          const t = Array.from(e.changedTouches).find(
            (x) => x.identifier === ids[0]
          );
          if (!t) return;
          const prev = this.touches.get(ids[0])!;
          this.pan(t.clientX - prev.x, t.clientY - prev.y);
          this.touches.set(ids[0], { x: t.clientX, y: t.clientY });
        } else if (ids.length >= 2) {
          // dois dedos: pinca da zoom e o meio dos dedos move a janela
          this.handlePinch(e, ids[0], ids[1]);
        }
      },
      { passive: false }
    );
    const endTouch = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        this.touches.delete(t.identifier);
      }
    };
    c.addEventListener("touchend", endTouch);
    c.addEventListener("touchcancel", endTouch);
  }

  private handlePinch(e: TouchEvent, idA: number, idB: number): void {
    const a0 = this.touches.get(idA)!;
    const b0 = this.touches.get(idB)!;
    const ta = Array.from(e.touches).find((x) => x.identifier === idA);
    const tb = Array.from(e.touches).find((x) => x.identifier === idB);
    if (!ta || !tb) return;

    const prevMidX = (a0.x + b0.x) / 2;
    const prevMidY = (a0.y + b0.y) / 2;
    const midX = (ta.clientX + tb.clientX) / 2;
    const midY = (ta.clientY + tb.clientY) / 2;

    const prevDist = Math.hypot(a0.x - b0.x, a0.y - b0.y) || 1;
    const dist = Math.hypot(ta.clientX - tb.clientX, ta.clientY - tb.clientY) || 1;

    // primeiro move pelo deslocamento do ponto medio
    this.pan(midX - prevMidX, midY - prevMidY);
    // depois aplica o zoom em torno do ponto medio
    this.zoomAt(midX, midY, prevDist / dist);

    this.touches.set(idA, { x: ta.clientX, y: ta.clientY });
    this.touches.set(idB, { x: tb.clientX, y: tb.clientY });
  }
}
