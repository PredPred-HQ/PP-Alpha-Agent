/**
 * PredictAlpha Agent Core
 * AI 驱动的预测交易代理核心逻辑
 */

import Anthropic from '@anthropic-ai/sdk';
import { PolymarketClient } from '../polymarket/client.js';
import { SignalGenerator, PredictionSignal } from '../polymarket/signals.js';
import { OKXMCPClient, OKXConfig } from '../okx/mcp-client.js';

export interface AgentConfig {
  anthropicApiKey: string;
  okxConfig: OKXConfig;
  maxPositionSizeUSD: number;
  maxLeverage: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  pollingIntervalMs: number;
}

export interface TradeDecision {
  execute: boolean;
  signal: PredictionSignal;
  tradeParams: {
    instId: string;
    side: 'buy' | 'sell';
    size: string;
    leverage?: number;
  } | null;
  reasoning: string;
  riskAssessment: {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    maxLoss: number;
    expectedGain: number;
  };
}

export class PredictAlphaAgent {
  private anthropic: Anthropic;
  private polymarket: PolymarketClient;
  private signalGenerator: SignalGenerator;
  private okx: OKXMCPClient;
  private config: AgentConfig;
  private isRunning = false;

  constructor(config: AgentConfig) {
    this.config = config;
    this.anthropic = new Anthropic({ apiKey: config.anthropicApiKey });
    this.polymarket = new PolymarketClient();
    this.signalGenerator = new SignalGenerator(this.polymarket);
    this.okx = new OKXMCPClient(config.okxConfig);
  }

  /**
   * 启动 Agent
   */
  async start(): Promise<void> {
    console.log('[Agent] Starting PredictAlpha Agent...');

    await this.okx.connect();
    this.isRunning = true;

    // 显示账户信息
    const balance = await this.okx.getBalance();
    console.log(`[Agent] Account balance: ${balance.totalEq} USDT`);

    // 开始主循环
    this.runLoop();
  }

  /**
   * 停止 Agent
   */
  async stop(): Promise<void> {
    console.log('[Agent] Stopping...');
    this.isRunning = false;
    await this.okx.disconnect();
  }

  /**
   * 主循环
   */
  private async runLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.tick();
      } catch (error) {
        console.error('[Agent] Error in tick:', error);
      }

      await this.sleep(this.config.pollingIntervalMs);
    }
  }

  /**
   * 单次循环
   */
  private async tick(): Promise<void> {
    console.log(`\n[Agent] Scanning markets at ${new Date().toISOString()}`);

    // 1. 扫描信号
    const signals = await this.signalGenerator.scanForSignals();
    console.log(`[Agent] Found ${signals.length} signals`);

    if (signals.length === 0) {
      console.log('[Agent] No actionable signals found');
      return;
    }

    // 2. 分析 top 信号
    const topSignals = signals.slice(0, 3);
    for (const signal of topSignals) {
      const decision = await this.analyzeSignal(signal);

      if (decision.execute && decision.tradeParams) {
        console.log(`[Agent] Executing trade: ${JSON.stringify(decision.tradeParams)}`);
        await this.executeTrade(decision);
      } else {
        console.log(`[Agent] Skipping: ${decision.reasoning}`);
      }
    }

    // 3. 检查现有持仓
    await this.checkPositions();
  }

  /**
   * 使用 Claude 分析信号
   */
  private async analyzeSignal(signal: PredictionSignal): Promise<TradeDecision> {
    const prompt = `
你是一个专业的加密货币交易分析师。基于以下预测市场信号，决定是否执行交易。

## 预测市场信号

**事件**: ${signal.eventTitle}
**问题**: ${signal.marketQuestion}
**YES 价格**: ${(signal.yesPrice * 100).toFixed(1)}%
**成交量**: $${signal.volume.toLocaleString()}
**流动性**: $${signal.liquidity.toLocaleString()}
**信号类型**: ${signal.signalType}
**置信度**: ${signal.confidence}%
**紧急程度**: ${signal.urgency}
**相关资产**: ${signal.relatedAssets.join(', ')}
**事件截止**: ${signal.eventEndDate}

## 交易约束

- 最大仓位: $${this.config.maxPositionSizeUSD}
- 最大杠杆: ${this.config.maxLeverage}x
- 止损: ${this.config.stopLossPercent}%
- 止盈: ${this.config.takeProfitPercent}%

## 任务

1. 分析这个预测市场信号对相关加密资产的影响
2. 评估风险等级 (LOW/MEDIUM/HIGH)
3. 决定是否执行交易
4. 如果执行，提供具体的交易参数

请以 JSON 格式回复：
{
  "execute": true/false,
  "reasoning": "决策原因",
  "riskLevel": "LOW/MEDIUM/HIGH",
  "tradeParams": {
    "instId": "BTC-USDT-SWAP",
    "side": "buy/sell",
    "sizeUSD": 100,
    "leverage": 3
  } // 如果不执行则为 null
}
`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    // 解析响应
    const content = response.content[0];
    if (content.type !== 'text') {
      return this.createNullDecision(signal, 'Invalid response from Claude');
    }

    try {
      // 提取 JSON
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.createNullDecision(signal, 'No JSON in response');
      }

      const result = JSON.parse(jsonMatch[0]);

      return {
        execute: result.execute,
        signal,
        tradeParams: result.tradeParams ? {
          instId: result.tradeParams.instId,
          side: result.tradeParams.side,
          size: String(result.tradeParams.sizeUSD / 100), // 转换为合约张数
          leverage: result.tradeParams.leverage,
        } : null,
        reasoning: result.reasoning,
        riskAssessment: {
          riskLevel: result.riskLevel,
          maxLoss: (result.tradeParams?.sizeUSD || 0) * (this.config.stopLossPercent / 100),
          expectedGain: (result.tradeParams?.sizeUSD || 0) * (this.config.takeProfitPercent / 100),
        },
      };
    } catch (error) {
      return this.createNullDecision(signal, `Parse error: ${error}`);
    }
  }

  /**
   * 执行交易
   */
  private async executeTrade(decision: TradeDecision): Promise<void> {
    if (!decision.tradeParams) return;

    const { instId, side, size, leverage } = decision.tradeParams;

    try {
      let result;

      if (instId.includes('SWAP')) {
        // 合约交易
        if (side === 'buy') {
          result = await this.okx.openLong(instId, size, leverage);
        } else {
          result = await this.okx.openShort(instId, size, leverage);
        }

        // 设置止盈止损
        const ticker = await this.okx.getTicker(instId);
        const currentPrice = parseFloat(ticker.last);
        const slPrice = side === 'buy'
          ? currentPrice * (1 - this.config.stopLossPercent / 100)
          : currentPrice * (1 + this.config.stopLossPercent / 100);
        const tpPrice = side === 'buy'
          ? currentPrice * (1 + this.config.takeProfitPercent / 100)
          : currentPrice * (1 - this.config.takeProfitPercent / 100);

        await this.okx.setTpSl({
          instId,
          posSide: side === 'buy' ? 'long' : 'short',
          slTriggerPx: slPrice.toFixed(2),
          tpTriggerPx: tpPrice.toFixed(2),
        });

        console.log(`[Agent] Set TP: ${tpPrice.toFixed(2)}, SL: ${slPrice.toFixed(2)}`);
      } else {
        // 现货交易
        if (side === 'buy') {
          result = await this.okx.marketBuy(instId, size);
        } else {
          result = await this.okx.marketSell(instId, size);
        }
      }

      console.log(`[Agent] Trade executed: ${result.ordId}`);
      console.log(`[Agent] Reasoning: ${decision.reasoning}`);
    } catch (error) {
      console.error(`[Agent] Trade failed:`, error);
    }
  }

  /**
   * 检查持仓状态
   */
  private async checkPositions(): Promise<void> {
    const positions = await this.okx.getPositions('SWAP');

    for (const pos of positions) {
      if (parseFloat(pos.pos) === 0) continue;

      const pnl = parseFloat(pos.upl);
      const pnlPercent = (pnl / parseFloat(pos.avgPx)) * 100;

      console.log(`[Agent] Position ${pos.instId} ${pos.posSide}: PnL ${pnl.toFixed(2)} (${pnlPercent.toFixed(2)}%)`);
    }
  }

  /**
   * 创建空决策
   */
  private createNullDecision(signal: PredictionSignal, reason: string): TradeDecision {
    return {
      execute: false,
      signal,
      tradeParams: null,
      reasoning: reason,
      riskAssessment: {
        riskLevel: 'HIGH',
        maxLoss: 0,
        expectedGain: 0,
      },
    };
  }

  /**
   * 睡眠
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 仅监控模式（不执行交易）
   */
  async monitor(): Promise<void> {
    console.log('[Agent] Starting in MONITOR mode (no trades will be executed)');

    while (true) {
      const signals = await this.signalGenerator.scanForSignals();

      console.log(`\n=== Signal Report (${new Date().toISOString()}) ===\n`);

      for (const signal of signals.slice(0, 10)) {
        console.log(`📊 ${signal.eventTitle}`);
        console.log(`   Question: ${signal.marketQuestion}`);
        console.log(`   YES: ${(signal.yesPrice * 100).toFixed(1)}% | Volume: $${signal.volume.toLocaleString()}`);
        console.log(`   Signal: ${signal.signalType} | Confidence: ${signal.confidence}%`);
        console.log(`   Assets: ${signal.relatedAssets.join(', ')}`);
        console.log(`   Action: ${signal.suggestedAction.action} ${signal.suggestedAction.asset} (${signal.suggestedAction.direction})`);
        console.log('');
      }

      await this.sleep(this.config.pollingIntervalMs);
    }
  }
}
