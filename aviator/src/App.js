import React, { useState, useEffect } from 'react'
import UnityGame from './UnityGame'
import './App.css'


const Navbar = () => (
  <div className="navbar">
    <div className="site-logo">Aviator</div>
    <div className="right-section">
      <div className="coin-section">
        <div className="coin-icon"></div>
        <span className="amount">0 ₹</span>
      </div>
      <div className="hamburger">☰</div>
    </div>
  </div>
);

const Multipliers = () => (
  <div className="multiplier-container">
    <div className="multiplier-scroll">
      <div className="multiplier" style={{color: '#fff'}}>1.03x</div>
      <div className="multiplier" style={{color: '#0f0'}}>1.19x</div>
      <div className="multiplier" style={{color: '#ff0'}}>1.77x</div>
      <div className="multiplier" style={{color: '#f00'}}>1.24x</div>
      <div className="multiplier" style={{color: '#f0f'}}>9.80x</div>
    </div>
  </div>
);

const GameWindow = () => (
  <div className="game-window">
    <UnityGame />
  </div>
);

const BettingSection = ({ title }) => {
  const [amount, setAmount] = useState(10);
  const [activeTab, setActiveTab] = useState('bet');
  const [autoCashOut, setAutoCashOut] = useState(false);
  const [autoMultiplier, setAutoMultiplier] = useState(1.1);
  const [isBetting, setIsBetting] = useState(false);
  const presetAmounts = [10, 100, 500, 1000];

  const adjustAmount = (increment) => {
    if (!isBetting) {
      setAmount(prev => Math.max(0, prev + increment));
    }
  };

  const handleBetClick = () => {
    setIsBetting(!isBetting);
  };

  return (
    <div className={`betting-section ${isBetting ? 'betting-active' : ''}`}>
      <div className="betting-tabs">
        <div className="tabs-container">
          <button 
            className={`tab ${activeTab === 'bet' ? 'active' : ''}`}
            onClick={() => setActiveTab('bet')}
          >
            {title}
          </button>
          <button 
            className={`tab ${activeTab === 'auto' ? 'active' : ''}`}
            onClick={() => setActiveTab('auto')}
          >
            Auto
          </button>
        </div>
      </div>
      
      <div className="betting-controls">
        <div className="main-controls">
          {isBetting && (
            <div className="waiting-text">WAITING FOR NEXT ROUND</div>
          )}
          <div className="amount-control">
            <div className="amount-adjuster">
              <button 
                onClick={() => adjustAmount(-10)} 
                className="adjuster-btn"
                disabled={isBetting}
              >−</button>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => !isBetting && setAmount(Number(e.target.value))}
                className="amount-input"
                disabled={isBetting}
              />
              <button 
                onClick={() => adjustAmount(10)} 
                className="adjuster-btn"
                disabled={isBetting}
              >+</button>
            </div>
            
            <div className="preset-amounts">
              <div className="preset-row">
                <button 
                  onClick={() => !isBetting && setAmount(10)} 
                  className="preset-btn"
                  disabled={isBetting}
                >10</button>
                <button 
                  onClick={() => !isBetting && setAmount(100)} 
                  className="preset-btn"
                  disabled={isBetting}
                >100</button>
              </div>
              <div className="preset-row">
                <button 
                  onClick={() => !isBetting && setAmount(500)} 
                  className="preset-btn"
                  disabled={isBetting}
                >500</button>
                <button 
                  onClick={() => !isBetting && setAmount(1000)} 
                  className="preset-btn"
                  disabled={isBetting}
                >1000</button>
              </div>
            </div>
          </div>

          <button 
            className={`bet-button ${isBetting ? 'cancel' : ''}`}
            onClick={handleBetClick}
          >
            <div className="bet-text">{isBetting ? 'CANCEL' : 'BET'}</div>
            {!isBetting && <div className="bet-amount">{amount}₹</div>}
          </button>
        </div>

        {activeTab === 'auto' && (
          <div className="auto-controls">
            <div className="divider"></div>
            <div className="auto-bottom-controls">
              <button className="auto-play-btn">AUTO PLAY</button>
              <div className="auto-cashout-control">
                <div className="toggle-container">
                  <span>Auto Cash Out</span>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={autoCashOut}
                      onChange={(e) => setAutoCashOut(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="multiplier-input-container">
                  <input
                    type="number"
                    value={autoMultiplier}
                    onChange={(e) => setAutoMultiplier(Number(e.target.value))}
                    disabled={!autoCashOut}
                    className="multiplier-input"
                    step="0.1"
                    min="1.1"
                  />
                  <span 
                    className="multiply-symbol" 
                    onClick={() => autoCashOut && setAutoMultiplier(1.1)}
                  >
                    ×
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const BettingHistory = () => {
  const [activeTab, setActiveTab] = useState('allBets');
  const [totalBets, setTotalBets] = useState(205160.8);
  const [currentBets, setCurrentBets] = useState([]);

  // Generate a single bet
  const generateBet = (id) => ({
    id,
    user: `user${Math.floor(Math.random() * 999)}`,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${Math.random()}`,
    bet: (7000 + Math.random() * 1500).toFixed(2),
    multiplier: (1 + Math.random() * 2).toFixed(2),
    cashout: null
  });

  // Static data for my bets
  const [myBets, setMyBets] = useState(() => {
    const date = new Date();
    return Array(20).fill(null).map((_, index) => ({
      id: index,
      date: new Date(date - index * 5 * 60000).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      bet: (5000 + Math.random() * 3000).toFixed(2),
      multiplier: (1 + Math.random()).toFixed(2),
      cashout: (5000 + Math.random() * 3000 * (1 + Math.random())).toFixed(2)
    }));
  });

  // Initialize and update all bets
  useEffect(() => {
    const initial = Array(10).fill(null).map((_, i) => generateBet(i));
    setCurrentBets(initial);

    const interval = setInterval(() => {
      const newBet = generateBet(Date.now());
      newBet.cashout = (parseFloat(newBet.bet) * parseFloat(newBet.multiplier)).toFixed(2);
      setTotalBets(prev => prev + parseFloat(newBet.bet));
      setCurrentBets(prev => [...prev.slice(1), newBet]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="betting-history">
      <div className="history-tabs">
        <div className="tabs-container">
          <button 
            className={`tab ${activeTab === 'allBets' ? 'active' : ''}`}
            onClick={() => setActiveTab('allBets')}
          >
            All Bets
          </button>
          <button 
            className={`tab ${activeTab === 'myBets' ? 'active' : ''}`}
            onClick={() => setActiveTab('myBets')}
          >
            My Bets
          </button>
        </div>
      </div>

      <div className="bets-container">
        {activeTab === 'allBets' ? (
          // All Bets View
          <>
            <div className="bets-header">
              <div className="total-bets-section">
                <div className="total-bets-header">
                  <span>ALL BETS</span>
                </div>
                <div className="total-amount">{totalBets.toFixed(2)}</div>
                <div className="divider"></div>
              </div>
              <div className="bets-columns">
                <span>User</span>
                <span>Bet, ₹</span>
                <span>X</span>
                <span>Cash out, ₹</span>
              </div>
            </div>
            <div className="bets-list">
              {currentBets.map((bet) => (
                <div key={bet.id} className={`bet-row ${bet.cashout ? 'won' : ''}`}>
                  <div className="user-info">
                    <img src={bet.avatar} alt="avatar" className="avatar" />
                    <span>{bet.user}</span>
                  </div>
                  <span className="bet-amount">{bet.bet}</span>
                  <span className="multiplier">{bet.multiplier}x</span>
                  <span className="cashout">{bet.cashout}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          // My Bets View
          <>
            <div className="bets-header">
              <div className="bets-columns my-bets-columns">
                <span>Date</span>
                <span>Bet, ₹</span>
                <span>X</span>
                <span>Cash out, ₹</span>
              </div>
            </div>
            <div className="bets-list my-bets-list">
              {myBets.map((bet) => (
                <div key={bet.id} className="bet-row won">
                  <span className="date">{bet.date}</span>
                  <span className="bet-amount">{bet.bet}</span>
                  <span className="multiplier">{bet.multiplier}x</span>
                  <span className="cashout">{bet.cashout}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <div className="desktop-wrapper">
      <div className="app-container">
        <Navbar />
        <Multipliers />
        <GameWindow />
        <div className="betting-sections">
          <BettingSection title="Bet" />
          <BettingSection title="Bet" />
        </div>
        <BettingHistory />
      </div>
    </div>
  )
}

export default App
