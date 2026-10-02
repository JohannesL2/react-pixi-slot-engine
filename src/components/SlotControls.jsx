import React, { useState } from 'react';
import { PAYLINES } from '../slotLogic';

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
  isFullscreen,
  onToggleFullscreen,
  onOpenPaytable,
  balance = 10000,
  selectedPaylines,
  onTogglePayline,
  totalBet,
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

  const controlsDisabled = isSpinning || autoSpinsLeft > 0;

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
    <div className="slot-controls" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', gap: '8px' }}>
      
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

      {/* Payline selection */}
      <div className="slot-controls__section slot-controls__paylines" style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <strong style={{ color: '#f0f0f0', marginRight: '4px' }}>Paylines:</strong>
        {PAYLINES.map(({ id, color }) => {
          const selected = selectedPaylines.includes(id);
          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected}
              aria-label={`Payline ${id}${selected ? ' selected' : ' not selected'}`}
              disabled={controlsDisabled}
              onClick={() => onTogglePayline(id)}
              style={{
                width: '34px',
                height: '32px',
                borderRadius: '5px',
                border: `2px solid ${color}`,
                color: selected ? '#09090c' : color,
                backgroundColor: selected ? color : '#181820',
                fontWeight: 'bold',
                opacity: selected ? 1 : 0.55,
                cursor: controlsDisabled ? 'not-allowed' : 'pointer',
              }}
            >
              {id}
            </button>
          );
        })}
        <span style={{ color: '#aaa', marginLeft: '5px' }}>
          {selectedPaylines.length}/9 active
        </span>
      </div>

      {/* Bet Adjustment (- / + / Max) */}
      <div className="slot-controls__section slot-controls__bet" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', justifyContent: 'center', gap: '5px' }}>
        <button
          onClick={handleDecreaseBet}
          disabled={controlsDisabled || currentBetIndex <= 0}
        >
          -
        </button>
        <span style={{ margin: '0 10px', minWidth: '80px', textAlign: 'center' }}>
          Bet/line: {bet} kr
        </span>
        <button
          onClick={handleIncreaseBet}
          disabled={controlsDisabled || currentBetIndex >= BET_LEVELS.length - 1}
        >
          +
        </button>
        <button
          onClick={handleMaxBet}
          disabled={controlsDisabled || currentBetIndex === BET_LEVELS.length - 1}
          style={{ marginLeft: '10px' }}
        >
          Max Bet
        </button>
        <span style={{ margin: '0 10px', minWidth: '110px', textAlign: 'center', color: '#ffd45c', fontWeight: 'bold' }}>
          Total: {totalBet.toLocaleString('sv-SE')} kr
        </span>
      </div>

      {/* Auto Spin */}
      <div className="slot-controls__section slot-controls__auto" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', position: 'relative' }}>
        <button
          onClick={handleAutoSpinClick}
          disabled={(isSpinning && autoSpinsLeft === 0) || (autoSpinsLeft === 0 && balance < totalBet)}
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
      <div className="slot-controls__section slot-controls__settings" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
        <button onClick={onToggleTurbo} disabled={isSpinning}>
          {isTurbo ? 'Disable Turbo' : 'Enable Turbo'}
        </button>
        <button onClick={onToggleMute}>
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <button onClick={onToggleFullscreen}>
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>

      {/* Paytable */}
      <div className="slot-controls__section slot-controls__paytable" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <button onClick={onOpenPaytable}>Paytable</button>
      </div>

      {/* Balance */}
      <div className="slot-controls__balance" style={{ marginTop: '5px', fontWeight: 'bold', color: '#f0f0f0' }}>
        <span>Balance: {balance.toLocaleString('sv-SE')} kr</span>
      </div>
    </div>
  );
}