# Mandelbrot Sandbox · WebGL2

<img width="1916" height="942" alt="image" src="https://github.com/user-attachments/assets/1a9c1fe2-2232-4c4c-8f28-8b10c1eeb98f" />

An interactive, GPU-accelerated Mandelbrot zoom sandbox. Dive into the fractal
forever, push the generation parameters as far as your hardware allows, and
repaint the whole set with your own palette.

Pan by dragging, zoom with the scroll wheel, double click to recenter, or flip
on **Auto zoom** for an endless dive. The escape-time iteration runs in
emulated double precision (double-single) inside the shader, so the zoom stays
sharp far deeper than plain 32-bit float would allow.

[Try it out here!](https://fernfunction.github.io/webgl-mandelbrot/)

## Commands

```bash
npm install      # install build dependencies
npm run dev      # dev server with HMR
npm run build    # type-check + emit dist/index.html (the final artifact)
npm run preview  # serve the production build
```

`dist/index.html` is fully self-contained: open it straight in a browser or
share it, no server needed.

## Source layout (`src/`)

| Module        | Responsibility                                          |
| ------------- | ------------------------------------------------------- |
| `gl-utils.ts` | WebGL2 context, programs, fullscreen quad blit.         |
| `shaders.ts`  | Vertex + Mandelbrot fragment shader (GLSL ES 3.00).     |
| `presets.ts`  | Famous locations, palettes, and generation parameters.  |
| `config.ts`   | Runtime config and preset application.                  |
| `renderer.ts` | Builds uniforms from the view and config, draws a frame. |
| `input.ts`    | Unified pan/zoom (mouse wheel, drag, double click, pinch). |
| `ui.ts`       | Control panel, palette editor, bindings.                |
| `i18n.ts`     | Tiny dictionary-based translations (EN, PT, ES).        |
| `main.ts`     | Main loop, auto zoom, palette cycling, resize, init.     |

## Features

- 8 presets, each a known spot in the set with its own palette.
- Constant auto zoom you can toggle on or off, with adjustable speed.
- Real-time generation controls: iterations, escape radius, and render
  resolution, so stronger GPUs can render denser sets.
- Editable palette: add or remove up to 8 colors, plus a separate inside color.
- Smooth (continuous) coloring and optional palette cycling.
- Emulated double precision for deep, crisp zoom.
- Mouse and touch: drag to pan, wheel to zoom, double click to recenter, pinch
  to zoom on touch.

## Requirements

A browser with WebGL2 (universal on modern desktop and mobile browsers).
