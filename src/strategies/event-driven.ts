/**
 * Event-Driven Strategy
 * 基于预测市场事件驱动的交易策略
 */

import { PredictionSignal } from '../polymarket/signals.js';

export interface StrategyConfig {
  minConfidence: number;
  minLiquidity: number;
  maxDaysToEvent: number;
  positionSizeByConfidence: {
    high: number;   // confidence >= 85
    medium: number; // confidence >= 75
    low: number;    // confidence >= 65
  };
}

export interface StrategyDecision {
  shouldTrade: boolean;
  positionSize: 'SMALL' | 'MEDIUM' | 'LARGE' | 'NONE';
  direction: 'LONG' | 'SHORT' | 'NONE';
  reasoning: string;
}

/**
 * 事件驱动策略
 * 根据预测市场信号决定交易方向和仓位
 */
export class EventDrivenStrategy {
  private config: StrategyConfig;

  constructor(config?: Partial<StrategyConfig>) {
    this.config = {
      minConfidence: 65,
      minLiquidity: 10000,
      maxDaysToEvent: 30,
      positionSizeByConfidence: {
        high: 1.0,    // 满仓
        medium: 0.5,  // 半仓
        low: 0.25,    // 轻仓
      },
      ...config,
    };
  }

  /**
   * 评估信号并生成策略决策
   */
  evaluate(signal: PredictionSignal): StrategyDecision {
    // 1. 检查基本条件
    if (signal.confidence < this.config.minConfidence) {
      return this.noTrade(`置信度不足: ${signal.confidence}% < ${this.config.minConfidence}%`);
    }

    if (signal.liquidity < this.config.minLiquidity) {
      return this.noTrade(`流动性不足: $${signal.liquidity} < $${this.config.minLiquidity}`);
    }

    // 2. 检查时间窗口
    const daysToEvent = this.calculateDaysToEvent(signal.eventEndDate);
    if (daysToEvent > this.config.maxDaysToEvent) {
      return this.noTrade(`事件太远: ${daysToEvent} 天后`);
    }

    // 3. 确定仓位大小
    let positionSize: 'SMALL' | 'MEDIUM' | 'LARGE';
    if (signal.confidence >= 85) {
      positionSize = 'LARGE';
    } else if (signal.confidence >= 75) {
      positionSize = 'MEDIUM';
    } else {
      positionSize = 'SMALL';
    }

    // 4. 确定方向
    let direction: 'LONG' | 'SHORT';
    if (signal.signalType === 'BULLISH') {
      direction = 'LONG';
    } else if (signal.signalType === 'BEARISH') {
      direction = 'SHORT';
    } else {
      return this.noTrade('信号中性，不建议交易');
    }

    // 5. 生成决策
    return {
      shouldTrade: true,
      positionSize,
      direction,
      reasoning: this.generateReasoning(signal, daysToEvent, positionSize, direction),
    };
  }

  /**
   * 计算距离事件的天数
   */
  private calculateDaysToEvent(eventEndDate: string): number {
    const now = new Date();
    const end = new Date(eventEndDate);
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * 生成不交易决策
   */
  private noTrade(reason: string): StrategyDecision {
    return {
      shouldTrade: false,
      positionSize: 'NONE',
      direction: 'NONE',
      reasoning: reason,
    };
  }

  /**
   * 生成决策理由
   */
  private generateReasoning(
    signal: PredictionSignal,
    daysToEvent: number,
    positionSize: string,
    direction: string
  ): string {
    const parts = [
      `预测市场 "${signal.eventTitle}" 显示 ${signal.signalType} 信号`,
      `YES 价格 ${(signal.yesPrice * 100).toFixed(1)}%`,
      `置信度 ${signal.confidence}%`,
      `流动性 $${signal.liquidity.toLocaleString()}`,
      `距事件 ${daysToEvent} 天`,
      `建议 ${direction} ${positionSize} 仓位`,
    ];

    return parts.join('，');
  }
}

/**
 * 宏观经济事件策略
 * 专注于美联储、通胀、GDP 等宏观事件
 */
export class MacroEventStrategy extends EventDrivenStrategy {
  private macroKeywords = [
    'fed', 'fomc', 'rate', 'interest',
    'inflation', 'cpi', 'pce',
    'gdp', 'recession',
    'employment', 'jobs', 'unemployment',
  ];

  /**
   * 检查是否是宏观经济事件
   */
  isMacroEvent(signal: PredictionSignal): boolean {
    const text = `${signal.eventTitle} ${signal.marketQuestion}`.toLowerCase();
    return this.macroKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * 宏观事件的特殊评估逻辑
   */
  evaluateMacro(signal: PredictionSignal): StrategyDecision {
    if (!this.isMacroEvent(signal)) {
      return {
        shouldTrade: false,
        positionSize: 'NONE',
        direction: 'NONE',
        reasoning: '非宏观经济事件',
      };
    }

    // 宏观事件需要更高的置信度
    const baseDecision = this.evaluate(signal);

    if (baseDecision.shouldTrade && signal.confidence < 75) {
      return {
        shouldTrade: false,
        positionSize: 'NONE',
        direction: 'NONE',
        reasoning: `宏观事件需要更高置信度: ${signal.confidence}% < 75%`,
      };
    }

    return baseDecision;
  }
}

/**
 * 加密货币特定事件策略
 * 专注于 ETF、监管、协议升级等
 */
export class CryptoEventStrategy extends EventDrivenStrategy {
  private cryptoKeywords = [
    'etf', 'sec', 'cftc', 'regulation',
    'bitcoin', 'ethereum', 'solana',
    'halving', 'upgrade', 'merge',
    'spot', 'futures',
  ];

  /**
   * 检查是否是加密货币特定事件
   */
  isCryptoEvent(signal: PredictionSignal): boolean {
    const text = `${signal.eventTitle} ${signal.marketQuestion}`.toLowerCase();
    return this.cryptoKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * 根据事件类型调整交易参数
   */
  evaluateCrypto(signal: PredictionSignal): StrategyDecision & { targetAsset: string } {
    const baseDecision = this.evaluate(signal);

    // 确定目标资产
    let targetAsset = 'BTC-USDT-SWAP';
    const text = `${signal.eventTitle} ${signal.marketQuestion}`.toLowerCase();

    if (text.includes('ethereum') || text.includes('eth')) {
      targetAsset = 'ETH-USDT-SWAP';
    } else if (text.includes('solana') || text.includes('sol')) {
      targetAsset = 'SOL-USDT-SWAP';
    }

    return {
      ...baseDecision,
      targetAsset,
    };
  }
}
