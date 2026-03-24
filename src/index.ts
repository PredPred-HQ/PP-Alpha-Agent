/**
 * PredictAlpha - Prediction-Powered Trading Agent
 * OKX AI Song Hackathon 2026
 */

import 'dotenv/config';
import { PredictAlphaAgent, AgentConfig } from './agent/core.js';
import { PolymarketClient } from './polymarket/client.js';
import { SignalGenerator } from './polymarket/signals.js';

// 解析命令行参数
const args = process.argv.slice(2);
const mode = args.find(a => a.startsWith('--mode='))?.split('=')[1] || 'trading';

// 环境变量验证
function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// 配置
const config: AgentConfig = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  anthropicBaseUrl: process.env.ANTHROPIC_BASE_URL,
  anthropicModel: process.env.ANTHROPIC_MODEL,
  okxConfig: {
    apiKey: process.env.OKX_API_KEY || '',
    secretKey: process.env.OKX_SECRET_KEY || '',
    passphrase: process.env.OKX_PASSPHRASE || '',
    simulated: process.env.OKX_SIMULATED === 'true',
  },
  maxPositionSizeUSD: parseInt(process.env.MAX_POSITION_SIZE_USD || '1000'),
  maxLeverage: parseInt(process.env.MAX_LEVERAGE || '3'),
  stopLossPercent: parseFloat(process.env.STOP_LOSS_PERCENT || '5'),
  takeProfitPercent: parseFloat(process.env.TAKE_PROFIT_PERCENT || '10'),
  pollingIntervalMs: parseInt(process.env.POLLING_INTERVAL_MS || '60000'),
};

// Banner
console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ██████╗ ██████╗ ███████╗██████╗ ██╗ ██████╗████████╗   ║
║   ██╔══██╗██╔══██╗██╔════╝██╔══██╗██║██╔════╝╚══██╔══╝   ║
║   ██████╔╝██████╔╝█████╗  ██║  ██║██║██║        ██║      ║
║   ██╔═══╝ ██╔══██╗██╔══╝  ██║  ██║██║██║        ██║      ║
║   ██║     ██║  ██║███████╗██████╔╝██║╚██████╗   ██║      ║
║   ╚═╝     ╚═╝  ╚═╝╚══════╝╚═════╝ ╚═╝ ╚═════╝   ╚═╝      ║
║                                                           ║
║         █████╗ ██╗     ██████╗ ██╗  ██╗ █████╗            ║
║        ██╔══██╗██║     ██╔══██╗██║  ██║██╔══██╗           ║
║        ███████║██║     ██████╔╝███████║███████║           ║
║        ██╔══██║██║     ██╔═══╝ ██╔══██║██╔══██║           ║
║        ██║  ██║███████╗██║     ██║  ██║██║  ██║           ║
║        ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝           ║
║                                                           ║
║   Prediction-Powered Trading Agent                        ║
║   OKX AI Song Hackathon 2026                              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

async function main() {
  console.log(`[Main] Mode: ${mode}`);
  console.log(`[Main] Simulated: ${config.okxConfig.simulated ? 'YES' : 'NO'}`);
  console.log(`[Main] Max Position: $${config.maxPositionSizeUSD}`);
  console.log(`[Main] Max Leverage: ${config.maxLeverage}x`);
  console.log('');

  switch (mode) {
    case 'monitor':
      await runMonitorMode();
      break;

    case 'backtest':
      await runBacktestMode();
      break;

    case 'demo':
      await runDemoMode();
      break;

    case 'trading':
    default:
      await runTradingMode();
      break;
  }
}

/**
 * 交易模式 - 完整的自动化交易
 */
async function runTradingMode() {
  console.log('[Main] Starting in TRADING mode');
  console.log('[Main] ⚠️  Real trades will be executed!\n');

  const agent = new PredictAlphaAgent(config);

  // 优雅退出
  process.on('SIGINT', async () => {
    console.log('\n[Main] Received SIGINT, shutting down...');
    await agent.stop();
    process.exit(0);
  });

  await agent.start();
}

/**
 * 监控模式 - 仅显示信号，不执行交易
 */
async function runMonitorMode() {
  console.log('[Main] Starting in MONITOR mode');
  console.log('[Main] No trades will be executed\n');

  const agent = new PredictAlphaAgent(config);
  await agent.monitor();
}

/**
 * 回测模式 - 使用历史数据测试策略
 */
async function runBacktestMode() {
  console.log('[Main] Starting in BACKTEST mode');
  console.log('[Main] This feature is under development\n');

  // TODO: 实现回测逻辑
  console.log('Backtest mode is not yet implemented.');
  console.log('Please use monitor mode for now.');
}

/**
 * 演示模式 - 展示系统功能
 */
async function runDemoMode() {
  console.log('[Main] Starting in DEMO mode\n');

  const polymarket = new PolymarketClient();
  const signalGenerator = new SignalGenerator(polymarket);

  console.log('=== Step 1: Fetching Polymarket Events ===\n');

  const events = await polymarket.getEvents({ limit: 5, closed: false });
  console.log(`Found ${events.length} active events:\n`);

  for (const event of events) {
    console.log(`📊 ${event.title}`);
    console.log(`   Liquidity: $${event.liquidity?.toLocaleString() || 'N/A'}`);
    console.log(`   Volume: $${event.volume?.toLocaleString() || 'N/A'}`);
    console.log(`   Markets: ${event.markets?.length || 0}`);
    console.log('');
  }

  console.log('=== Step 2: Generating Trading Signals ===\n');

  const signals = await signalGenerator.scanForSignals();
  console.log(`Generated ${signals.length} signals:\n`);

  for (const signal of signals.slice(0, 5)) {
    console.log(`🎯 ${signal.eventTitle}`);
    console.log(`   Question: ${signal.marketQuestion}`);
    console.log(`   YES Price: ${(signal.yesPrice * 100).toFixed(1)}%`);
    console.log(`   Signal: ${signal.signalType} | Confidence: ${signal.confidence}%`);
    console.log(`   Related Assets: ${signal.relatedAssets.join(', ')}`);
    console.log(`   Suggested: ${signal.suggestedAction.action} ${signal.suggestedAction.asset}`);
    console.log('');
  }

  console.log('=== Demo Complete ===\n');
  console.log('To start trading, run: npm start');
  console.log('To monitor only, run: npm run monitor');
}

// 运行
main().catch(error => {
  console.error('[Main] Fatal error:', error);
  process.exit(1);
});
