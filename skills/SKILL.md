---
name: pp-alpha
description: |
  PP-Alpha-Agent: Prediction-Powered Trading Agent for OKX.
  Trigger this skill when the user asks about:
  - Trading based on prediction market signals
  - Polymarket event analysis and crowd wisdom
  - Opening/closing positions on OKX based on prediction data
  - Automated trading strategies using prediction markets
  - "pp-alpha", "prediction trade", "crowd wisdom trading"
license: MIT
metadata:
  author: PredPred-HQ
  version: "1.0.0"
  homepage: "https://github.com/PredPred-HQ/PP-Alpha-Agent"
  tags: ["prediction-market", "polymarket", "okx", "ai-trading", "automated-trading"]
  agent:
    requires:
      bins: ["pp-alpha"]
      optional_env: ["OKX_API_KEY", "OKX_SECRET_KEY", "OKX_PASSPHRASE"]
---

# PP-Alpha-Agent

> Prediction-Powered Trading Agent for OKX

Transform crowd wisdom from Polymarket prediction markets into actionable OKX trading signals.

```
┌─────────────────────────────────────────────────────────────┐
│                      PP-Alpha-Agent                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐  │
│  │ Polymarket  │ ───► │  AI Agent   │ ───► │    OKX      │  │
│  │ Prediction  │      │  Analysis   │      │  Trading    │  │
│  └─────────────┘      └─────────────┘      └─────────────┘  │
│                                                             │
│  • Market sentiment       • Signal scoring    • Spot/Futures│
│  • YES/NO prices          • Risk assessment   • Auto TP/SL  │
│  • Volume analysis        • Asset mapping     • Grid bots   │
└─────────────────────────────────────────────────────────────┘
```

## Installation

```bash
# Clone and install
git clone https://github.com/PredPred-HQ/PP-Alpha-Agent.git
cd PP-Alpha-Agent
npm install

# Link CLI globally
npm link
```

## Quick Start

### 1. Scan for Signals

```bash
pp-alpha signal scan
```

Output:
```
=== PP-Alpha Trading Signals ===

🟢 BULLISH Signal (Confidence: 85%)
   Event: Fed Rate Decision March 2026
   Question: Will the Fed cut rates by 25bp?
   YES Price: 72% | Volume: $2.3M
   Related Assets: BTC, ETH
   Action: BUY BTC-USDT-SWAP (LONG, MEDIUM size)
```

### 2. Execute Trade

```bash
# Open long position
pp-alpha trade long BTC-USDT-SWAP --size 100 --leverage 3

# Set risk management
pp-alpha trade set-tpsl BTC-USDT-SWAP --tp 95000 --sl 88000 --side long
```

### 3. Monitor

```bash
# Check positions
pp-alpha trade positions

# Continuous monitoring
pp-alpha trade monitor
```

## Skills

| Skill | Description |
|-------|-------------|
| `pp-alpha-signal` | Scan prediction markets, generate trading signals |
| `pp-alpha-trade` | Execute trades, manage positions, set TP/SL |
| `pp-alpha-market` | Get OKX market data, account balance |

## Configuration

Create `.env` file:

```bash
# OKX API (required for trading)
OKX_API_KEY=your_api_key
OKX_SECRET_KEY=your_secret_key
OKX_PASSPHRASE=your_passphrase
OKX_SIMULATED=true  # Demo mode

# AI Provider (optional, for advanced analysis)
DASHSCOPE_API_KEY=your_qwen_key
```

## How It Works

1. **Signal Generation**: Monitors Polymarket for crypto-related prediction events
2. **Sentiment Analysis**: Maps YES/NO prices to BULLISH/BEARISH signals
3. **Asset Mapping**: Links events to tradeable assets (BTC, ETH, SOL, etc.)
4. **Risk Scoring**: Calculates confidence based on volume, liquidity, and price deviation
5. **Trade Execution**: Executes trades on OKX with built-in risk management

## Example Strategy

```
Scenario: Fed Rate Decision

Polymarket shows:
- "Fed will cut rates in March" YES price: 35% → 72%
- Volume surge: 500%

PP-Alpha detects:
- BULLISH signal for BTC/ETH (rate cuts favor risk assets)
- Confidence: 85%
- Urgency: HIGH (event in 3 days)

Action:
- Open long BTC-USDT-SWAP
- Set TP at +10%, SL at -5%
- Auto-close after event
```

## CLI Reference

```bash
pp-alpha signal scan [--limit N] [--min-confidence N]
pp-alpha trade long <inst> [--size N] [--leverage N]
pp-alpha trade short <inst> [--size N] [--leverage N]
pp-alpha trade close <inst> [--side long|short]
pp-alpha trade positions
pp-alpha trade set-tpsl <inst> [--tp N] [--sl N]
pp-alpha market ticker <inst>
pp-alpha market candles <inst> [--bar 1H] [--limit 10]
pp-alpha market balance
```

## License

MIT - PredPred-HQ
