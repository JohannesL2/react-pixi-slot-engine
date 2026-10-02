import { useEffect, useRef, useState, useCallback } from 'react';
import { Application, Assets, Sprite, Container, Graphics } from 'pixi.js';
import gsap from 'gsap';
import SlotControls from './components/SlotControls';
import {
  calculateTotalBet,
  evaluateGrid,
  PAYLINES,
  pickRandomSymbol,
  SYMBOL_CONFIGS,
} from './slotLogic';

export const SlotGame = () => {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const appRef = useRef(null);
  const reelsRef = useRef([]);
  const sheetRef = useRef(null);

  // --- STATES ---
  const [balance, setBalance] = useState(10000);
  const [bet, setBet] = useState(10);
  const [selectedPaylines, setSelectedPaylines] = useState(() =>
    PAYLINES.map(({ id }) => id)
  );
  const [winningPaylines, setWinningPaylines] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [autoSpinsLeft, setAutoSpinsLeft] = useState(0);
  const [isTurbo, setIsTurbo] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPaytable, setShowPaytable] = useState(false);
  const [winInfo, setWinInfo] = useState({ totalWin: 0, message: '' });
  const totalBet = calculateTotalBet(bet, selectedPaylines);

  // --- HANDLERS for SLOTCONTROLS ---
  const handleStartAutoSpin = (count) => {
    setAutoSpinsLeft(count);
  };

  const handleStopAutoSpin = () => {
    setAutoSpinsLeft(0);
  };

  const handleToggleTurbo = () => {
    setIsTurbo((prev) => !prev);
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handleToggleFullscreen = async () => {
    const target = gameRef.current;

    if (!target) return;

    try {
      if (!document.fullscreenElement) {
        await target.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Unable to toggle fullscreen mode:', error);
    }
  };

  const handleOpenPaytable = () => {
    setShowPaytable(true);
  };

  const handleTogglePayline = (lineId) => {
    setWinningPaylines([]);
    setSelectedPaylines((current) => {
      if (current.includes(lineId)) {
        return current.length > 1 ? current.filter((id) => id !== lineId) : current;
      }
      return PAYLINES.filter(({ id }) => current.includes(id) || id === lineId)
        .map(({ id }) => id);
    });
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

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
          const randomKey = pickRandomSymbol();
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

  // --- SPIN FUNCTION ---
  const handleSpin = useCallback(() => {
    if (isSpinning || !sheetRef.current) return;
    if (balance < totalBet) {
      setAutoSpinsLeft(0);
      setWinInfo({ totalWin: 0, message: 'Not enough balance for selected lines' });
      return;
    }

    setIsSpinning(true);
    setBalance((prev) => prev - totalBet);
    setWinInfo({ totalWin: 0, message: '' });
    setWinningPaylines([]);

    const stepY = 140;
    const symbolSize = 130;
    const gridHeight = 3 * stepY;
    const startY = (600 - gridHeight) / 2 + symbolSize / 2;
    const bottomLimit = startY + 4 * stepY;

    // Turbo settings
    const duration = isTurbo ? 0.6 : 1.5;
    const delayPerReel = isTurbo ? 0.05 : 0.12;

    reelsRef.current.forEach((reel, reelIndex) => {
      const delay = reelIndex * delayPerReel;

      const currentY = reel.y;
      reel.y = 0;
      reel.children.forEach((child) => {
        child.y += currentY;
      });

      gsap.to(reel, {
        y: stepY * 12,
        duration: duration,
        delay: delay,
        ease: 'back.out(0.7)',
        onUpdate: () => {
          reel.children.forEach((child) => {
            const worldY = reel.y + child.y;
            if (worldY > bottomLimit) {
              child.y -= stepY * 6;
              const randomKey = pickRandomSymbol();
              child.texture = sheetRef.current.textures[randomKey];
            }
          });
        },
        onComplete: () => {
          if (reelIndex === reelsRef.current.length - 1) {
            const stoppedGrid = reelsRef.current.map((stoppedReel) =>
              [0, 1, 2].map((row) => {
                const targetY = startY + row * stepY;
                const stoppedSymbol = stoppedReel.children.reduce((closest, child) => {
                  const distance = Math.abs(stoppedReel.y + child.y - targetY);
                  return distance < closest.distance ? { child, distance } : closest;
                }, { child: null, distance: Infinity }).child;
                const symbolKey = SYMBOL_CONFIGS.find(
                  ({ id }) => sheetRef.current.textures[id] === stoppedSymbol.texture
                )?.id;
                if (!symbolKey) {
                  throw new Error('Unable to identify a stopped reel symbol');
                }
                return symbolKey;
              })
            );
            const { totalWin, wins } = evaluateGrid(stoppedGrid, bet, selectedPaylines);
            const wonLines = wins.map(({ line }) => line);

            if (totalWin > 0) {
              setBalance((prev) => prev + totalWin);
              setWinInfo({
                totalWin,
                message: `WIN: ${totalWin.toLocaleString('sv-SE')} kr! (Line${wonLines.length > 1 ? 's' : ''} ${wonLines.join(', ')})`,
              });
            }
            setWinningPaylines(wonLines);

            setIsSpinning(false);

            // Less auto spins left if any
            if (autoSpinsLeft > 0) {
              setAutoSpinsLeft((prev) => Math.max(0, prev - 1));
            }
          }
        },
      });
    });
  }, [isSpinning, balance, totalBet, bet, selectedPaylines, isTurbo, autoSpinsLeft]);

  // --- AUTO SPIN LOOP EFFECT ---
  useEffect(() => {
    if (!isSpinning && autoSpinsLeft > 0) {
      const timer = setTimeout(() => {
        handleSpin();
      }, isTurbo ? 200 : 600);
      return () => clearTimeout(timer);
    }
  }, [isSpinning, autoSpinsLeft, handleSpin, isTurbo]);

  return (
    <div ref={gameRef} className={`slot-game${isFullscreen ? ' slot-game--fullscreen' : ''}`}>
      {/* Win message */}
      <div className="slot-win-message">
        <h2 className="slot-win-text" style={{ color: winInfo.totalWin > 0 ? '#00ff88' : '#888' }}>
          {winInfo.message}
        </h2>
      </div>

      <div className="slot-game-board">
        <div className="slot-game-canvas">
          <div ref={canvasRef} />
          <svg
            viewBox="0 0 900 600"
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          >
            {PAYLINES.filter(({ id }) => selectedPaylines.includes(id)).map((payline) => {
              const isWinner = winningPaylines.includes(payline.id);
              const points = payline.rows
                .map((row, reelIndex) => `${165 + reelIndex * 140},${155 + row * 140}`)
                .join(' ');
              return (
                <polyline
                  key={payline.id}
                  points={points}
                  fill="none"
                  stroke={payline.color}
                  strokeWidth={isWinner ? 8 : 4}
                  strokeOpacity={isWinner ? 1 : 0.55}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
        </div>
      </div>

      <div className="slot-game-controls">
        <SlotControls
          bet={bet}
          onBetChange={setBet}
          isSpinning={isSpinning}
          autoSpinsLeft={autoSpinsLeft}
          onStartAutoSpin={handleStartAutoSpin}
          onStopAutoSpin={handleStopAutoSpin}
          isTurbo={isTurbo}
          onToggleTurbo={handleToggleTurbo}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          onOpenPaytable={handleOpenPaytable}
          balance={balance}
          selectedPaylines={selectedPaylines}
          onTogglePayline={handleTogglePayline}
          totalBet={totalBet}
        />

        <button
          className="slot-spin-button"
          onClick={handleSpin}
          disabled={isSpinning || balance < totalBet}
          style={{
            backgroundColor: isSpinning ? '#333' : '#ff0055',
            color: '#fff',
            border: '4px solid #ff3377',
            cursor: isSpinning || balance < totalBet ? 'not-allowed' : 'pointer',
            boxShadow: isSpinning ? 'none' : '0 0 20px rgba(255, 0, 85, 0.4)',
            transition: 'all 0.15s ease',
          }}
        >
          {isSpinning ? 'Spinning...' : 'SPIN'}
        </button>
      </div>

      {/* Win table Modal */}
      {showPaytable && (
        <div
          onClick={() => setShowPaytable(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#181822',
              border: '1px solid #333345',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              color: '#fff',
              fontFamily: 'sans-serif',
            }}
          >
            <h2 style={{ marginTop: 0, color: '#00ff88' }}>Win Table</h2>
            <p style={{ color: '#aaa', fontSize: '14px' }}>
              Wins are checked left to right on each selected payline. Each line pays its multiplier times the bet per line.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '20px 0' }}>
              {SYMBOL_CONFIGS.map((s) => (
                <div key={s.id} style={{ backgroundColor: '#101018', padding: '8px', borderRadius: '6px' }}>
                  <strong style={{ color: '#fff' }}>{s.id.replace('.png', '').toUpperCase()}</strong>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                    5x: {s.payouts[5]}x | 4x: {s.payouts[4]}x | 3x: {s.payouts[3]}x
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowPaytable(false)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#ff0055',
                border: 'none',
                color: '#fff',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};