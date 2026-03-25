---
name: pp-alpha-trade
description: |
  Trigger this skill when the user asks about:
  - Executing trades on OKX based on prediction signals
  - Opening long or short positions
  - Setting stop-loss and take-profit orders
  - Managing positions and risk
  - "buy", "sell", "open long", "open short", "close position"
  - "execute trade", "place order", "set stop loss"
license: MIT
metadata:
  author: PredPred-HQ
  version: "1.0.0"
  tags: ["okx", "trading", "futures", "spot", "ai-trading"]
  agent:
    requires:
      bins: ["pp-alpha"]
      env: ["OKX_API_KEY", "OKX_SECRET_KEY", "OKX_PASSPHRASE"]
---

# PP-Alpha Trade - AI-Powered Trading Execution

This skill executes trades on OKX exchange based on prediction market signals.

## Security

- All API credentials are stored locally in environment variables
- Supports simulated trading mode for testing
- Built-in risk management with stop-loss/take-profit

## Configuration

Create a `.env` file with your OKX credentials:

```bash
# OKX API Credentials
OKX_API_KEY=your_api_key
OKX_SECRET_KEY=your_secret_key
OKX_PASSPHRASE=your_passphrase
OKX_SIMULATED=true  # Set to false for live trading
```

## Usage

### Open Positions

```bash
# Open a long position on BTC futures
pp-alpha trade long BTC-USDT-SWAP --size 100 --leverage 3

# Open a short position
pp-alpha trade short ETH-USDT-SWAP --size 50 --leverage 2

# Market buy spot
pp-alpha trade buy BTC-USDT --amount 500
```

### Close Positions

```bash
# Close a specific position
pp-alpha trade close BTC-USDT-SWAP --side long

# Close all positions
pp-alpha trade close-all
```

### Set Risk Management

```bash
# Set stop-loss and take-profit
pp-alpha trade set-tpsl BTC-USDT-SWAP --tp 90000 --sl 82000 --side long

# View current positions with PnL
pp-alpha trade positions
```

### Auto-Trade Mode

```bash
# Start automated trading based on prediction signals
pp-alpha trade auto --max-position 1000 --max-leverage 3

# Monitor mode (signals only, no execution)
pp-alpha trade monitor
```

## Example Workflow

```bash
# 1. Scan for signals
pp-alpha signal scan --min-confidence 80

# 2. Execute a trade based on top signal
pp-alpha trade long BTC-USDT-SWAP --size 100 --leverage 3

# 3. Set risk management
pp-alpha trade set-tpsl BTC-USDT-SWAP --tp 95000 --sl 88000 --side long

# 4. Monitor position
pp-alpha trade positions
```

## Risk Warning

Trading cryptocurrencies involves significant risk. Always:
- Start with simulated trading (`OKX_SIMULATED=true`)
- Use appropriate position sizing
- Set stop-loss orders
- Never risk more than you can afford to lose

## Related Skills

- `pp-alpha-signal`: Generate trading signals from prediction markets
- `pp-alpha-market`: Get real-time OKX market data
