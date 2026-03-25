---
name: pp-alpha-market
description: |
  Trigger this skill when the user asks about:
  - OKX market data, prices, or tickers
  - Candlestick/OHLCV data
  - Account balance or portfolio information
  - "what is the price of BTC", "show me ETH candles"
  - "check my balance", "show portfolio"
license: MIT
metadata:
  author: PredPred-HQ
  version: "1.0.0"
  tags: ["okx", "market-data", "prices", "portfolio"]
  agent:
    requires:
      bins: ["pp-alpha"]
---

# PP-Alpha Market - OKX Market Data & Portfolio

This skill provides real-time market data from OKX and portfolio information.

## Capabilities

- Real-time price tickers
- Candlestick/OHLCV data
- Account balance and positions
- No API key required for public market data

## Usage

### Price Information

```bash
# Get current price
pp-alpha market ticker BTC-USDT

# Get multiple tickers
pp-alpha market ticker BTC-USDT ETH-USDT SOL-USDT

# Get futures ticker
pp-alpha market ticker BTC-USDT-SWAP
```

### Candlestick Data

```bash
# Get 1-hour candles (default)
pp-alpha market candles BTC-USDT

# Get specific timeframe
pp-alpha market candles BTC-USDT --bar 15m --limit 50

# Available timeframes: 1m, 5m, 15m, 1H, 4H, 1D
```

### Account Information (requires API key)

```bash
# Get account balance
pp-alpha market balance

# Get current positions
pp-alpha market positions

# Get position details for specific instrument
pp-alpha market positions BTC-USDT-SWAP
```

## Example Outputs

### Ticker Response

```
BTC-USDT
  Last: 87,234.50
  Bid: 87,230.00
  Ask: 87,238.00
  24h Volume: 12,345.67 BTC
  24h Change: +2.34%
```

### Balance Response

```
Account Balance
  Total Equity: 15,234.56 USDT
  Available: 10,123.45 USDT
  Frozen: 5,111.11 USDT
```

### Position Response

```
BTC-USDT-SWAP (Long)
  Size: 0.5 BTC
  Entry: 85,000.00
  Current: 87,234.50
  PnL: +1,117.25 (+2.63%)
  Leverage: 3x
```

## Related Skills

- `pp-alpha-signal`: Generate trading signals from prediction markets
- `pp-alpha-trade`: Execute trades on OKX
