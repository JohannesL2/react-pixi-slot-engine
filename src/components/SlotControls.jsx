import React, { useState } from 'react';

const BET_LEVELS = [10, 20, 50, 100, 200, 500, 1000];
const AUTO_SPIN_OPTIONS = [10, 25, 50, 100];

export default function SlotControls({
  bet,
  onBetChange,
  isSpinning = false,
  autoSpinsLeft = 0,
  onStartAutoSpin,
  onStopAutoSpin,
  isTurbo,
  onToggleTurbo,
  isMuted,
  onToggleMute,
  onOpenPaytable,
  balance = 10000,
}) {
  const [showAutoOptions, setShowAutoOptions] = useState(false);

  const currentBetIndex = BET_LEVELS.indexOf(bet);

  const handleDecreaseBet = () => {
    if (currentBetIndex > 0) {
      onBetChange(BET_LEVELS[currentBetIndex - 1]);
    }
  };

  const handleIncreaseBet = () => {
    if (currentBetIndex < BET_LEVELS.length - 1) {
      onBetChange(BET_LEVELS[currentBetIndex + 1]);
    }
  };

  const handleMaxBet = () => {
    onBetChange(BET_LEVELS[BET_LEVELS.length - 1]);
  };

  const handleSelectAutoSpin = (count) => {
    setShowAutoOptions(false);
    onStartAutoSpin(count);
  };

  const handleAutoSpinClick = () => {
    if (autoSpinsLeft > 0) {
      onStopAutoSpin();
    } else {
      setShowAutoOptions((prev) => !prev);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      
      {/* Click area outside to close Auto Spin menu automatically */}
      {showAutoOptions && (
        <div
          onClick={() => setShowAutoOptions(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5,
          }}
        />
      )}

      {/* Bet Adjustment (- / + / Max) */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <button
          onClick={handleDecreaseBet}
          disabled={isSpinning || currentBetIndex <= 0 || autoSpinsLeft > 0}
        >
          -
        </button>
        <span style={{ margin: '0 10px', minWidth: '80px', textAlign: 'center' }}>
          Bet: {bet} kr
        </span>
        <button
          onClick={handleIncreaseBet}
          disabled={isSpinning || currentBetIndex >= BET_LEVELS.length - 1 || autoSpinsLeft > 0}
        >
          +
        </button>
        <button
          onClick={handleMaxBet}
          disabled={isSpinning || currentBetIndex === BET_LEVELS.length - 1 || autoSpinsLeft > 0}
          style={{ marginLeft: '10px' }}
        >
          Max Bet
        </button>
      </div>

      {/* Auto Spin */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', position: 'relative' }}>
        <button
          onClick={handleAutoSpinClick}
          disabled={isSpinning && autoSpinsLeft === 0}
          style={{ zIndex: 6 }}
        >
          {autoSpinsLeft > 0 ? `Stop Auto (${autoSpinsLeft})` : 'Start Auto Spin'}
        </button>

        {showAutoOptions && !isSpinning && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              backgroundColor: '#222',
              border: '1px solid #444',
              padding: '6px',
              borderRadius: '6px',
              zIndex: 10,
              minWidth: '100px',
            }}
          >
            {AUTO_SPIN_OPTIONS.map((count) => (
              <button
                key={count}
                onClick={() => handleSelectAutoSpin(count)}
                style={{ display: 'block', margin: '4px 0', width: '100%', cursor: 'pointer' }}
              >
                {count} Spins
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Settings (Turbo & Sounds)*/}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <button onClick={onToggleTurbo} disabled={isSpinning}>
          {isTurbo ? 'Disable Turbo' : 'Enable Turbo'}
        </button>
        <button onClick={onToggleMute} style={{ marginLeft: '10px' }}>
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>

      {/* Paytable */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <button onClick={onOpenPaytable}>Paytable</button>
      </div>

      {/* Balance */}
      <div style={{ marginTop: '5px', fontWeight: 'bold' }}>
        <span>Balance: {balance.toLocaleString('sv-SE')} kr</span>
      </div>
    </div>
  );
}