# PP-Alpha-Agent Architecture

## System Overview

```
┌────────────────────────────────────────────────────────────────┐
│                        PP-Alpha-Agent                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │  Polymarket  │    │   Claude     │    │   OKX        │     │
│  │  Data Layer  │───►│   AI Core    │───►│   Trading    │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│         │                   │                   │              │
│         ▼                   ▼                   ▼              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │   Signal     │    │   Strategy   │    │   Position   │     │
│  │   Generator  │    │   Engine     │    │   Manager    │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
"""

## Component Details

### 1. Polymarket Data Layer

**Files:** `src/polymarket/`

- **client.ts** - Polymarket API client
  - Gamma API for market/event data
  - CLOB API for real-time prices and orderbook
  - Rate limiting and error handling

- **signals.ts** - Signal generation
  - Market scanning and filtering
  - Confidence scoring algorithm
  - Related asset detection

### 2. Claude AI Core

**Integration:** Anthropic SDK

- Analyzes prediction signals
- Generates trade decisions
- Provides reasoning and risk assessment
- Natural language understanding of market context

### 3. OKX Trading Layer

**Files:** `src/okx/`

- **mcp-client.ts** - OKX Agent Trade Kit MCP client
  - Account management (balance, positions)
  - Order execution (market, limit, stop)
  - Position management (open, close, TP/SL)
  - Strategy bots (grid trading)

### 4. Strategy Engine

**Files:** `src/strategies/`

- **event-driven.ts** - Event-based strategies
  - EventDrivenStrategy - Base strategy
  - MacroEventStrategy - Fed/inflation events
  - CryptoEventStrategy - ETF/regulation events

### 5. Agent Core

**Files:** `src/agent/`

- **core.ts** - Main agent orchestration
  - Signal scanning loop
  - Decision making with Claude
  - Trade execution
  - Position monitoring

## Data Flow

```
1. SCAN
   Polymarket API ──► Events/Markets ──► Signal Generator

2. ANALYZE
   Signals ──► Claude AI ──► Trade Decisions

3. EXECUTE
   Decisions ──► OKX MCP Client ──► Exchange Orders

4. MONITOR
   Positions ──► PnL Tracking ──► Risk Management
```

## Signal Scoring Algorithm

```python
confidence = 50  # base

# Price divergence (0-50 points)
confidence += abs(yes_price - 0.5) * 100

# Liquidity bonus (0-15 points)
if liquidity > 100000: confidence += 15
elif liquidity > 50000: confidence += 10
elif liquidity > 10000: confidence += 5

# Volume bonus (0-15 points)
if volume > 1000000: confidence += 15
elif volume > 500000: confidence += 10
elif volume > 100000: confidence += 5

# Cap at 100
confidence = min(100, confidence)
```

## Risk Management

### Position Sizing

| Confidence | Position Size |
|------------|---------------|
| >= 85%     | LARGE (100%)  |
| >= 75%     | MEDIUM (50%)  |
| >= 65%     | SMALL (25%)   |
| < 65%      | NONE (0%)     |

### Stop Loss / Take Profit

- Default Stop Loss: 5%
- Default Take Profit: 10%
- Automatically set via OKX algo orders

### Max Exposure

- Max position size: $1000 (configurable)
- Max leverage: 3x (configurable)
- Max concurrent positions: 5

## API Endpoints Used

### Polymarket

| Endpoint | Purpose |
|----------|---------|
| GET /events | List active events |
| GET /events/slug/{slug} | Event details |
| GET /markets/slug/{slug} | Market details |
| GET /price | Current price |
| GET /book | Order book |
| GET /midpoint | Mid price |

### OKX (via MCP)

| Tool | Purpose |
|------|---------|
| okx_get_balance | Account balance |
| okx_get_positions | Open positions |
| okx_place_order | Execute trades |
| okx_set_leverage | Set leverage |
| okx_set_tp_sl | Stop loss / take profit |
| okx_close_position | Close position |

## Configuration

Environment variables in `.env`:

```env
# Required
ANTHROPIC_API_KEY=       # Claude API
OKX_API_KEY=            # OKX API
OKX_SECRET_KEY=         # OKX Secret
OKX_PASSPHRASE=         # OKX Passphrase

# Optional
OKX_SIMULATED=true      # Paper trading
MAX_POSITION_SIZE_USD=1000
MAX_LEVERAGE=3
STOP_LOSS_PERCENT=5
TAKE_PROFIT_PERCENT=10
POLLING_INTERVAL_MS=60000
```
