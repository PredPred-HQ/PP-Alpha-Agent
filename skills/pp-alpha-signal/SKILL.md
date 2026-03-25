---
name: pp-alpha-signal
description: |
  Trigger this skill when the user asks about:
  - Prediction market signals or analysis
  - Polymarket events and market data
  - Trading signals from prediction markets
  - Market sentiment or crowd wisdom signals
  - "scan markets", "find signals", "prediction signals"
  - "what are the top prediction signals"
license: MIT
metadata:
  author: PredPred-HQ
  version: "1.0.0"
  tags: ["prediction-market", "signals", "polymarket", "ai-trading"]
  agent:
    requires:
      bins: ["pp-alpha"]
---

# PP-Alpha Signal - Prediction Market Signal Generator

This skill generates trading signals by analyzing prediction market data from Polymarket.

## Capabilities

- Scan Polymarket for crypto-related prediction events
- Generate trading signals based on market sentiment
- Analyze YES/NO prices and volume changes
- Identify high-confidence trading opportunities

## Usage

### Scan for Trading Signals

```bash
# Scan all markets and generate signals
pp-alpha signal scan

# Scan with custom limit
pp-alpha signal scan --limit 20

# Show only high confidence signals (>80%)
pp-alpha signal scan --min-confidence 80
```

### Get Specific Market Details

```bash
# Get details for a specific event
pp-alpha signal market <event-id>

# Get signal history
pp-alpha signal history --days 7
```

## Example Outputs

### Signal Scan Result

```
=== PP-Alpha Trading Signals ===

BULLISH Signal (Confidence: 85%)
  Event: Fed Rate Decision March 2026
  Question: Will the Fed cut rates by 25bp?
  YES Price: 72% | Volume: $2.3M
  Related Assets: BTC, ETH
  Action: BUY BTC-USDT-SWAP (LONG, MEDIUM size)

BEARISH Signal (Confidence: 78%)
  Event: SEC ETH ETF Decision
  Question: Will SEC approve ETH ETF by Q2?
  YES Price: 28% | Volume: $1.8M
  Related Assets: ETH
  Action: SELL ETH-USDT (SHORT, SMALL size)
```

## Signal Types

| Type | Description | Typical Action |
|------|-------------|----------------|
| BULLISH | High YES price (>65%) with rising volume | Open long position |
| BEARISH | Low YES price (<35%) with rising volume | Open short position |
| NEUTRAL | Uncertain market (40-60%) | Hold/Observe |

## Related Skills

- `pp-alpha-trade`: Execute trades based on signals
- `pp-alpha-market`: Get real-time OKX market data
