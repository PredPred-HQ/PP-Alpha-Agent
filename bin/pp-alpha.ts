#!/usr/bin/env node
/**
 * PP-Alpha CLI
 * Command-line interface for PP-Alpha-Agent
 *
 * Usage:
 *   pp-alpha signal scan           - Scan prediction markets for signals
 *   pp-alpha trade long <inst>     - Open long position
 *   pp-alpha market ticker <inst>  - Get ticker data
 */

import 'dotenv/config';
import { PolymarketClient } from '../src/polymarket/client.js';
import { SignalGenerator, PredictionSignal } from '../src/polymarket/signals.js';
import { OKXMCPClient, OKXConfig } from '../src/okx/mcp-client.js';

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const subcommand = args[1];

// Helper to parse flags
function getFlag(name: string, defaultValue: string = ''): string {
  const index = args.findIndex(a => a === `--${name}` || a.startsWith(`--${name}=`));
  if (index === -1) return defaultValue;
  if (args[index].includes('=')) {
    return args[index].split('=')[1];
  }
  return args[index + 1] || defaultValue;
}

function hasFlag(name: string): boolean {
  return args.some(a => a === `--${name}` || a.startsWith(`--${name}=`));
}

// OKX Config from environment
const okxConfig: OKXConfig = {
  apiKey: process.env.OKX_API_KEY || '',
  secretKey: process.env.OKX_SECRET_KEY || '',
  passphrase: process.env.OKX_PASSPHRASE || '',
  simulated: process.env.OKX_SIMULATED === 'true',
};

// ============ Signal Commands ============

async function signalScan() {
  const limit = parseInt(getFlag('limit', '10'));
  const minConfidence = parseInt(getFlag('min-confidence', '60'));

  console.log('Scanning prediction markets for signals...\n');

  const client = new PolymarketClient();
  const generator = new SignalGenerator(client);

  const signals = await generator.scanForSignals();
  const filtered = signals.filter(s => s.confidence >= minConfidence).slice(0, limit);

  if (filtered.length === 0) {
    console.log('No signals found matching criteria.');
    return;
  }

  console.log(`=== PP-Alpha Trading Signals (${filtered.length} found) ===\n`);

  for (const signal of filtered) {
    printSignal(signal);
  }
}

function printSignal(signal: PredictionSignal) {
  const emoji = signal.signalType === 'BULLISH' ? '🟢' : signal.signalType === 'BEARISH' ? '🔴' : '⚪';

  console.log(`${emoji} ${signal.signalType} Signal (Confidence: ${signal.confidence}%)`);
  console.log(`   Event: ${signal.eventTitle}`);
  console.log(`   Question: ${signal.marketQuestion}`);
  console.log(`   YES Price: ${(signal.yesPrice * 100).toFixed(1)}% | Volume: $${signal.volume.toLocaleString()}`);
  console.log(`   Related Assets: ${signal.relatedAssets.join(', ')}`);
  console.log(`   Action: ${signal.suggestedAction.action} ${signal.suggestedAction.asset} (${signal.suggestedAction.direction}, ${signal.suggestedAction.size} size)`);
  console.log(`   Urgency: ${signal.urgency} | End Date: ${signal.eventEndDate}`);
  console.log('');
}

// ============ Trade Commands ============

async function tradeLong() {
  const instId = args[2];
  if (!instId) {
    console.error('Error: Instrument ID required. Usage: pp-alpha trade long BTC-USDT-SWAP');
    process.exit(1);
  }

  const size = getFlag('size', '1');
  const leverage = parseInt(getFlag('leverage', '3'));

  console.log(`Opening LONG position: ${instId}`);
  console.log(`  Size: ${size}, Leverage: ${leverage}x`);
  console.log(`  Mode: ${okxConfig.simulated ? 'SIMULATED' : 'LIVE'}\n`);

  const okx = new OKXMCPClient(okxConfig);
  await okx.connect();

  const result = await okx.openLong(instId, size, leverage);
  console.log(`Order placed: ${result.ordId}`);
  console.log(`Status: ${result.sMsg || 'Success'}`);
}

async function tradeShort() {
  const instId = args[2];
  if (!instId) {
    console.error('Error: Instrument ID required. Usage: pp-alpha trade short ETH-USDT-SWAP');
    process.exit(1);
  }

  const size = getFlag('size', '1');
  const leverage = parseInt(getFlag('leverage', '3'));

  console.log(`Opening SHORT position: ${instId}`);
  console.log(`  Size: ${size}, Leverage: ${leverage}x`);
  console.log(`  Mode: ${okxConfig.simulated ? 'SIMULATED' : 'LIVE'}\n`);

  const okx = new OKXMCPClient(okxConfig);
  await okx.connect();

  const result = await okx.openShort(instId, size, leverage);
  console.log(`Order placed: ${result.ordId}`);
  console.log(`Status: ${result.sMsg || 'Success'}`);
}

async function tradeBuy() {
  const instId = args[2];
  if (!instId) {
    console.error('Error: Instrument ID required. Usage: pp-alpha trade buy BTC-USDT');
    process.exit(1);
  }

  const amount = getFlag('amount', '100');

  console.log(`Market BUY: ${instId}`);
  console.log(`  Amount: ${amount} USDT`);
  console.log(`  Mode: ${okxConfig.simulated ? 'SIMULATED' : 'LIVE'}\n`);

  const okx = new OKXMCPClient(okxConfig);
  await okx.connect();

  const result = await okx.marketBuy(instId, amount);
  console.log(`Order placed: ${result.ordId}`);
  console.log(`Status: ${result.sMsg || 'Success'}`);
}

async function tradeClose() {
  const instId = args[2];
  if (!instId) {
    console.error('Error: Instrument ID required. Usage: pp-alpha trade close BTC-USDT-SWAP --side long');
    process.exit(1);
  }

  const side = getFlag('side', 'long') as 'long' | 'short';

  console.log(`Closing position: ${instId} (${side})`);
  console.log(`  Mode: ${okxConfig.simulated ? 'SIMULATED' : 'LIVE'}\n`);

  const okx = new OKXMCPClient(okxConfig);
  await okx.connect();

  const result = await okx.closePosition(instId, side);
  console.log(`Position closed: ${result.ordId || 'Success'}`);
}

async function tradePositions() {
  console.log('Fetching positions...\n');

  const okx = new OKXMCPClient(okxConfig);
  await okx.connect();

  const positions = await okx.getPositions('SWAP');
  const activePositions = positions.filter(p => parseFloat(p.pos) !== 0);

  if (activePositions.length === 0) {
    console.log('No active positions.');
    return;
  }

  console.log('=== Active Positions ===\n');

  for (const pos of activePositions) {
    const pnl = parseFloat(pos.upl);
    const pnlSign = pnl >= 0 ? '+' : '';

    console.log(`${pos.instId} (${pos.posSide.toUpperCase()})`);
    console.log(`  Size: ${pos.pos}`);
    console.log(`  Entry: ${pos.avgPx}`);
    console.log(`  PnL: ${pnlSign}${pnl.toFixed(2)} USDT`);
    console.log(`  Leverage: ${pos.lever}x`);
    console.log('');
  }
}

async function tradeSetTpSl() {
  const instId = args[2];
  if (!instId) {
    console.error('Error: Instrument ID required. Usage: pp-alpha trade set-tpsl BTC-USDT-SWAP --tp 90000 --sl 82000');
    process.exit(1);
  }

  const tp = getFlag('tp');
  const sl = getFlag('sl');
  const side = getFlag('side', 'long') as 'long' | 'short';

  if (!tp && !sl) {
    console.error('Error: At least one of --tp or --sl is required.');
    process.exit(1);
  }

  console.log(`Setting TP/SL for ${instId} (${side})`);
  if (tp) console.log(`  Take Profit: ${tp}`);
  if (sl) console.log(`  Stop Loss: ${sl}`);
  console.log('');

  const okx = new OKXMCPClient(okxConfig);
  await okx.connect();

  const result = await okx.setTpSl({
    instId,
    posSide: side,
    tpTriggerPx: tp || undefined,
    slTriggerPx: sl || undefined,
  });

  console.log(`TP/SL set: ${result.algoId}`);
}

async function tradeMonitor() {
  console.log('Starting monitor mode (Ctrl+C to exit)...\n');

  const client = new PolymarketClient();
  const generator = new SignalGenerator(client);
  const interval = parseInt(getFlag('interval', '60')) * 1000;

  while (true) {
    const signals = await generator.scanForSignals();
    const topSignals = signals.slice(0, 5);

    console.log(`\n=== Signal Report (${new Date().toISOString()}) ===\n`);

    for (const signal of topSignals) {
      printSignal(signal);
    }

    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

// ============ Market Commands ============

async function marketTicker() {
  const instruments = args.slice(2).filter(a => !a.startsWith('--'));

  if (instruments.length === 0) {
    console.error('Error: Instrument ID(s) required. Usage: pp-alpha market ticker BTC-USDT');
    process.exit(1);
  }

  const okx = new OKXMCPClient(okxConfig);

  for (const instId of instruments) {
    try {
      const ticker = await okx.getTicker(instId);
      console.log(`\n${instId}`);
      console.log(`  Last: ${parseFloat(ticker.last).toLocaleString()}`);
      console.log(`  Bid: ${parseFloat(ticker.bidPx).toLocaleString()}`);
      console.log(`  Ask: ${parseFloat(ticker.askPx).toLocaleString()}`);
      console.log(`  24h Volume: ${parseFloat(ticker.vol24h).toLocaleString()}`);
    } catch (error: any) {
      console.error(`Error fetching ${instId}: ${error.message}`);
    }
  }
}

async function marketCandles() {
  const instId = args[2];
  if (!instId) {
    console.error('Error: Instrument ID required. Usage: pp-alpha market candles BTC-USDT');
    process.exit(1);
  }

  const bar = getFlag('bar', '1H') as '1m' | '5m' | '15m' | '1H' | '4H' | '1D';
  const limit = parseInt(getFlag('limit', '10'));

  const okx = new OKXMCPClient(okxConfig);
  const candles = await okx.getCandles(instId, bar, limit);

  console.log(`\n${instId} - ${bar} Candles\n`);
  console.log('Time                 | Open       | High       | Low        | Close      | Volume');
  console.log('-'.repeat(90));

  for (const candle of candles.reverse()) {
    const time = new Date(parseInt(candle.ts)).toISOString().slice(0, 19);
    console.log(`${time} | ${parseFloat(candle.o).toFixed(2).padStart(10)} | ${parseFloat(candle.h).toFixed(2).padStart(10)} | ${parseFloat(candle.l).toFixed(2).padStart(10)} | ${parseFloat(candle.c).toFixed(2).padStart(10)} | ${parseFloat(candle.vol).toFixed(2)}`);
  }
}

async function marketBalance() {
  console.log('Fetching account balance...\n');

  const okx = new OKXMCPClient(okxConfig);
  await okx.connect();

  const balance = await okx.getBalance();

  console.log('=== Account Balance ===\n');
  console.log(`  Total Equity: ${parseFloat(balance.totalEq).toLocaleString()} USDT`);
  console.log(`  Available: ${parseFloat(balance.availBal).toLocaleString()} USDT`);
  console.log(`  Frozen: ${parseFloat(balance.frozenBal).toLocaleString()} USDT`);
}

// ============ Help ============

function showHelp() {
  console.log(`
PP-Alpha CLI - Prediction-Powered Trading Agent

USAGE:
  pp-alpha <command> <subcommand> [options]

COMMANDS:

  signal
    scan                      Scan prediction markets for trading signals
      --limit <n>             Number of signals to show (default: 10)
      --min-confidence <n>    Minimum confidence % (default: 60)

  trade
    long <inst>               Open a long futures position
      --size <n>              Position size
      --leverage <n>          Leverage multiplier (default: 3)

    short <inst>              Open a short futures position
      --size <n>              Position size
      --leverage <n>          Leverage multiplier (default: 3)

    buy <inst>                Market buy (spot)
      --amount <n>            Amount in USDT

    close <inst>              Close a position
      --side <long|short>     Position side

    positions                 List active positions

    set-tpsl <inst>           Set take-profit/stop-loss
      --tp <price>            Take profit price
      --sl <price>            Stop loss price
      --side <long|short>     Position side

    monitor                   Monitor signals (no trading)
      --interval <seconds>    Polling interval (default: 60)

  market
    ticker <inst> [inst...]   Get ticker data
    candles <inst>            Get candlestick data
      --bar <1m|5m|15m|1H|4H|1D>  Timeframe (default: 1H)
      --limit <n>             Number of candles (default: 10)
    balance                   Get account balance

EXAMPLES:
  pp-alpha signal scan --min-confidence 80
  pp-alpha trade long BTC-USDT-SWAP --size 100 --leverage 3
  pp-alpha market ticker BTC-USDT ETH-USDT
  pp-alpha trade monitor

ENVIRONMENT:
  OKX_API_KEY          OKX API key
  OKX_SECRET_KEY       OKX secret key
  OKX_PASSPHRASE       OKX passphrase
  OKX_SIMULATED        Set to 'true' for demo trading
`);
}

// ============ Main ============

async function main() {
  try {
    switch (command) {
      case 'signal':
        switch (subcommand) {
          case 'scan':
            await signalScan();
            break;
          default:
            console.error(`Unknown signal subcommand: ${subcommand}`);
            showHelp();
        }
        break;

      case 'trade':
        switch (subcommand) {
          case 'long':
            await tradeLong();
            break;
          case 'short':
            await tradeShort();
            break;
          case 'buy':
            await tradeBuy();
            break;
          case 'close':
            await tradeClose();
            break;
          case 'positions':
            await tradePositions();
            break;
          case 'set-tpsl':
            await tradeSetTpSl();
            break;
          case 'monitor':
            await tradeMonitor();
            break;
          default:
            console.error(`Unknown trade subcommand: ${subcommand}`);
            showHelp();
        }
        break;

      case 'market':
        switch (subcommand) {
          case 'ticker':
            await marketTicker();
            break;
          case 'candles':
            await marketCandles();
            break;
          case 'balance':
            await marketBalance();
            break;
          case 'positions':
            await tradePositions();
            break;
          default:
            console.error(`Unknown market subcommand: ${subcommand}`);
            showHelp();
        }
        break;

      case 'help':
      case '--help':
      case '-h':
      default:
        showHelp();
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
