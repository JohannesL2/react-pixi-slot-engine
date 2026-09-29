import { useEffect, useRef, useState } from 'react';
import { Application, Assets, Sprite, Container, Graphics } from 'pixi.js';
import gsap from 'gsap';

const SYMBOL_KEYS = [
  'dice.png',
  'spray_can.png',
  'vs_wild.png',
  'letter_a.png',
  'letter_k.png',
  'crossed_heart.png',
  'boombox.png',
  'crown.png',
  'coin.png',
];

export const SlotGame = () => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const reelsRef = useRef([]);
  const sheetRef = useRef(null);

  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    let active = true;

    async function initPixi() {
      const app = new Application();
      await app.init({
        width: 900,
        height: 600,
        backgroundColor: 0x0c0c0e,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (!active) return;
      appRef.current = app;

      if (canvasRef.current) {
        canvasRef.current.appendChild(app.canvas);
      }

      const sheet = await Assets.load('/assets/texture.json');
      sheetRef.current = sheet;

      // Settings for 5x3 grid
      const cols = 5;
      const symbolSize = 130;
      const padding = 10;
      const stepY = symbolSize + padding;
      const reelWidth = symbolSize + padding;

      const gridWidth = cols * reelWidth;
      const gridHeight = 3 * stepY;

      // Calculate starting positions to center the grid
      const startX = (900 - gridWidth) / 2 + symbolSize / 2;
      const startY = (600 - gridHeight) / 2 + symbolSize / 2;

      // Container for game reels
      const reelsContainer = new Container();
      app.stage.addChild(reelsContainer);

      // Mask symbols that are outside the visible area
      const mask = new Graphics()
        .rect(
          startX - symbolSize / 2,
          startY - symbolSize / 2,
          gridWidth,
          gridHeight
        )
        .fill(0xffffff);

      app.stage.addChild(mask);
      reelsContainer.mask = mask;

      // Build reels and symbols
      for (let i = 0; i < cols; i++) {
        const reelContainer = new Container();
        reelContainer.x = startX + i * reelWidth;
        reelsContainer.addChild(reelContainer);

        for (let j = 0; j < 6; j++) {
          const randomKey = SYMBOL_KEYS[Math.floor(Math.random() * SYMBOL_KEYS.length)];
          const sprite = new Sprite(sheet.textures[randomKey]);

          sprite.anchor.set(0.5);
          sprite.width = symbolSize;
          sprite.height = symbolSize;
          sprite.x = 0;
          sprite.y = startY + (j - 2) * stepY;

          reelContainer.addChild(sprite);
        }

        reelsRef.current.push(reelContainer);
      }
    }

    initPixi();

    return () => {
      active = false;
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
      }
    };
  }, []);

  const handleSpin = () => {
    if (isSpinning || !sheetRef.current) return;
    setIsSpinning(true);

    const stepY = 140;
    const symbolSize = 130;
    const gridHeight = 3 * stepY;
    const startY = (600 - gridHeight) / 2 + symbolSize / 2;
    const bottomLimit = startY + 4 * stepY;

    reelsRef.current.forEach((reel, reelIndex) => {
      const delay = reelIndex * 0.12;

      const currentY = reel.y;
      reel.y = 0;
      reel.children.forEach((child) => {
        child.y += currentY;
      });

      gsap.to(reel, {
        y: stepY * 12,
        duration: 1.5,
        delay: delay,
        ease: 'back.out(0.7)',
        onUpdate: () => {
          reel.children.forEach((child) => {
            const worldY = reel.y + child.y;
            // När en symbol passerar under spelfältets botten flyttas den upp till toppen
            if (worldY > bottomLimit) {
              child.y -= stepY * 6;
              const randomKey = SYMBOL_KEYS[Math.floor(Math.random() * SYMBOL_KEYS.length)];
              child.texture = sheetRef.current.textures[randomKey];
            }
          });
        },
        onComplete: () => {
          if (reelIndex === reelsRef.current.length - 1) {
            setIsSpinning(false);
          }
        },
      });
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', background: '#0a0a0c', minHeight: '100vh', padding: '10px' }}>


      <div ref={canvasRef} style={{ borderRadius: '8px', overflow: 'hidden', border: '2px solid #222' }} />

      <button
        onClick={handleSpin}
        disabled={isSpinning}
        style={{
          minWidth: '220px',
          padding: '16px 0',
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#fff',
          backgroundColor: isSpinning ? '#444' : '#ff0055',
          border: 'none',
          borderRadius: '8px',
          cursor: isSpinning ? 'not-allowed' : 'pointer',
          transition: 'transform 0.1s',
        }}
      >
        {isSpinning ? 'Spinning...' : 'SPIN'}
      </button>
    </div>
  );
};