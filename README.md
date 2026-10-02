# React + PixiJS v8 Slot Engine

A high-performance, modular **5x3 slot machine engine** built with **React**, **PixiJS v8**, **GSAP**, and **Bun**. 

Designed as a modern iGaming frontend prototype featuring a gritty urban aesthetic, custom texture rendering, dynamic graphic masking, and decoupled reel animations.

<img width="100%" alt="screenshot-react-pixi-slot-engine" src="https://github.com/user-attachments/assets/20e0755c-6403-4c48-aa06-f4513f9c1d49" />

---

## Tech Stack

* **Engine / Rendering:** [PixiJS v8](https://pixijs.com/) (WebGL / WebGPU)
* **UI Framework:** [React 18](https://react.dev/)
* **Animations & Easing:** [GSAP 3](https://greensock.com/gsap/)
* **Build Tool & Bundler:** [Vite 5](https://vitejs.dev/)
* **Runtime & Package Manager:** [Bun](https://bun.sh/)

---

## Features

* **5x3 Reel Grid**
* **Graphic Mask Layering**
* **Staggered Reel Animations**
* **Symbol Recycling System:** Efficient infinite-scroll math that recycles off-screen sprites on loops.
* **Texture Atlas Integration:** Optimized sprite loading via JSON texture sheets (`/public/assets/texture.json`).

---

## Getting Started

### Prerequisites

Ensure you have [Bun](https://bun.sh/) installed on your machine.

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/johannesl2/react-pixi-slot-engine.git](https://github.com/johannesl2/react-pixi-slot-engine.git)
   cd react-pixi-slot-engine
