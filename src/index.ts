/**
 * PP-Alpha-Agent - Prediction-Powered Trading Agent
 * OKX AI Song Hackathon 2026
 */

import 'dotenv/config';
import { PPAlphaAgent, AgentConfig, AIProviderConfig } from './agent/core.js';
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

// AI模型配置 - 支持多种AI提供商
let aiProvider: AIProviderConfig;
if (process.env.DASHSCOPE_API_KEY) {
  // 阿里百炼 Qwen 配置 (OpenAI 兼容格式)
  aiProvider = {
    type: 'dashscope',
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseUrl: process.env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: process.env.DASHSCOPE_MODEL || 'qwen-plus',
  };
} else if (process.env.OPENAI_API_KEY) {
  // OpenAI 配置
  aiProvider = {
    type: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.OPENAI_MODEL || 'gpt-4o',
  };
} else if (process.env.ANTHROPIC_API_KEY) {
  // Anthropic 配置
  aiProvider = {
    type: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseUrl: process.env.ANTHROPIC_BASE_URL,
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
  };
} else if (process.env.TOGETHER_API_KEY) {
  // Together AI 配置
  aiProvider = {
    type: 'together',
    apiKey: process.env.TOGETHER_API_KEY,
    baseUrl: 'https://api.together.xyz/v1',
    model: process.env.TOGETHER_MODEL || 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
  };
} else if (process.env.GROQ_API_KEY) {
  // Groq 配置
  aiProvider = {
    type: 'groq',
    apiKey: process.env.GROQ_API_KEY,
    baseUrl: 'https://api.groq.com/openai/v1',
    model: process.env.GROQ_MODEL || 'llama3-70b-8192',
  };
} else if (process.env.CUSTOM_AI_API_KEY) {
  // 自定义AI提供商
  aiProvider = {
    type: 'custom',
    apiKey: process.env.CUSTOM_AI_API_KEY,
    baseUrl: process.env.CUSTOM_AI_BASE_URL || 'https://api.custom-ai-provider.com/v1',
    model: process.env.CUSTOM_AI_MODEL || 'default-model',
  };
} else {
  // 默认使用一个假的模型用于测试（不进行真正的API调用）
  aiProvider = {
    type: 'mock',
    apiKey: 'mock-key',
    baseUrl: 'http://localhost',
    model: 'mock-model',
  };
}

// 配置
const config: AgentConfig = {
  aiProvider: aiProvider,
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
║   PPPP  PPPP      -Alpha-       AAAAA  GGGGG  EEEEE  N   N ║
║   P   P P   P     -Agent-      A   A G       E      NN  N ║
║   P   P P   P                AAAAAAA G  GGG  EEEE   N N N ║
║   PPPP  PPPP               A       A G   G   E      N  NN ║
║   P     P                 A         A  GGGG  EEEEE  N   N ║
║   P     P                                                    ║
║                                                           ║
║         AAAAA  IIIII  GGGGG  EEEEE  N   N  TTTTT           ║
║        A   A    I   G       E      NN  N    T             ║
║        AAAAAAA   I   G  GGG  EEEE   N N N    T             ║
║        A       A  I   G   G   E      N  NN    T             ║
║        A         A III  GGGG  EEEEE  N   N    T             ║
║                                                           ║
║   Prediction-Powered Trading Agent                        ║
║   OKX AI Song Hackathon 2026                              ║
║   AI Provider: ${aiProvider.type.toUpperCase()}                                ║
╚═══════════════════════════════════════════════════════════╝
`);

async function main() {
  console.log(`[Main] Mode: ${mode}`);
  console.log(`[Main] Simulated: ${config.okxConfig.simulated ? 'YES' : 'NO'}`);
  console.log(`[Main] Max Position: $${config.maxPositionSizeUSD}`);
  console.log(`[Main] Max Leverage: ${config.maxLeverage}x`);
  console.log(`[Main] AI Provider: ${aiProvider.type}`);
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

  const agent = new PPAlphaAgent(config);

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

  const agent = new PPAlphaAgent(config);
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