/**
 * Polymarket Signal Generator
 * 从预测市场数据生成交易信号
 */

import { PolymarketClient, PolymarketEvent, PolymarketMarket } from './client.js';

export interface PredictionSignal {
  eventId: string;
  eventTitle: string;
  marketQuestion: string;

  // 价格信息
  yesPrice: number;
  noPrice: number;
  priceChange24h: number;

  // 流动性信息
  volume: number;
  liquidity: number;
  volumeChange24h: number;

  // 信号评估
  signalType: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number; // 0-100
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';

  // 关联资产
  relatedAssets: string[];

  // 建议操作
  suggestedAction: TradingAction;

  // 时间信息
  eventEndDate: string;
  generatedAt: string;
}

export interface TradingAction {
  action: 'BUY' | 'SELL' | 'HOLD';
  asset: string;
  direction: 'LONG' | 'SHORT' | 'NONE';
  size: 'SMALL' | 'MEDIUM' | 'LARGE';
  reasoning: string;
}

interface PriceHistory {
  tokenId: string;
  prices: { price: number; timestamp: number }[];
}

export class SignalGenerator {
  private client: PolymarketClient;
  private priceHistory: Map<string, PriceHistory> = new Map();

  constructor(client: PolymarketClient) {
    this.client = client;
  }

  /**
   * 扫描所有相关市场并生成信号
   */
  async scanForSignals(): Promise<PredictionSignal[]> {
    const events = await this.client.getCryptoEvents(50);
    const signals: PredictionSignal[] = [];

    for (const event of events) {
      for (const market of event.markets || []) {
        const signal = await this.analyzeMarket(event, market);
        if (signal && signal.confidence >= 60) {
          signals.push(signal);
        }
      }
    }

    // 按置信度排序
    return signals.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 分析单个市场
   */
  async analyzeMarket(
    event: PolymarketEvent,
    market: PolymarketMarket
  ): Promise<PredictionSignal | null> {
    const prices = this.client.parseMarketPrices(market);
    const relatedAssets = this.detectRelatedAssets(event.title, market.question);

    if (relatedAssets.length === 0) {
      return null; // 跳过非加密相关市场
    }

    // 计算信号强度
    const { signalType, confidence } = this.calculateSignalStrength(
      prices,
      market.volume,
      market.liquidity
    );

    // 确定紧急程度
    const urgency = this.calculateUrgency(event.endDate, market.volume);

    // 生成建议操作
    const suggestedAction = this.generateAction(
      signalType,
      confidence,
      relatedAssets[0],
      event.title
    );

    return {
      eventId: event.id,
      eventTitle: event.title,
      marketQuestion: market.question,
      yesPrice: prices.yes,
      noPrice: prices.no,
      priceChange24h: 0, // TODO: 需要历史数据
      volume: market.volume,
      liquidity: market.liquidity,
      volumeChange24h: 0,
      signalType,
      confidence,
      urgency,
      relatedAssets,
      suggestedAction,
      eventEndDate: event.endDate,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * 检测关联资产
   */
  private detectRelatedAssets(title: string, question: string): string[] {
    const text = `${title} ${question}`.toLowerCase();
    const assets: string[] = [];

    const assetMap: Record<string, string> = {
      'bitcoin': 'BTC',
      'btc': 'BTC',
      'ethereum': 'ETH',
      'eth': 'ETH',
      'solana': 'SOL',
      'sol': 'SOL',
      'xrp': 'XRP',
      'ripple': 'XRP',
      'dogecoin': 'DOGE',
      'doge': 'DOGE',
    };

    // 宏观经济事件影响所有加密资产
    const macroKeywords = ['fed', 'rate', 'inflation', 'recession', 'gdp', 'sec', 'etf'];
    if (macroKeywords.some(k => text.includes(k))) {
      assets.push('BTC', 'ETH'); // 宏观事件主要影响 BTC 和 ETH
    }

    // 特定资产
    for (const [keyword, asset] of Object.entries(assetMap)) {
      if (text.includes(keyword) && !assets.includes(asset)) {
        assets.push(asset);
      }
    }

    return assets;
  }

  /**
   * 计算信号强度
   */
  private calculateSignalStrength(
    prices: { yes: number; no: number },
    volume: number,
    liquidity: number
  ): { signalType: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; confidence: number } {
    // 基于价格偏离计算方向
    const priceDiff = prices.yes - 0.5;

    let signalType: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    if (priceDiff > 0.15) {
      signalType = 'BULLISH';
    } else if (priceDiff < -0.15) {
      signalType = 'BEARISH';
    } else {
      signalType = 'NEUTRAL';
    }

    // 置信度计算
    let confidence = 50;

    // 价格偏离越大，置信度越高
    confidence += Math.abs(priceDiff) * 100;

    // 流动性越高，置信度越高
    if (liquidity > 100000) confidence += 15;
    else if (liquidity > 50000) confidence += 10;
    else if (liquidity > 10000) confidence += 5;

    // 成交量越大，置信度越高
    if (volume > 1000000) confidence += 15;
    else if (volume > 500000) confidence += 10;
    else if (volume > 100000) confidence += 5;

    return {
      signalType,
      confidence: Math.min(100, Math.round(confidence)),
    };
  }

  /**
   * 计算紧急程度
   */
  private calculateUrgency(
    endDate: string,
    volume: number
  ): 'LOW' | 'MEDIUM' | 'HIGH' {
    const now = new Date();
    const end = new Date(endDate);
    const daysRemaining = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (daysRemaining < 1) return 'HIGH';
    if (daysRemaining < 7) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * 生成交易建议
   */
  private generateAction(
    signalType: 'BULLISH' | 'BEARISH' | 'NEUTRAL',
    confidence: number,
    asset: string,
    eventTitle: string
  ): TradingAction {
    if (signalType === 'NEUTRAL' || confidence < 65) {
      return {
        action: 'HOLD',
        asset,
        direction: 'NONE',
        size: 'SMALL',
        reasoning: `信号不够明确 (置信度: ${confidence}%)，建议观望`,
      };
    }

    const direction = signalType === 'BULLISH' ? 'LONG' : 'SHORT';
    const action = signalType === 'BULLISH' ? 'BUY' : 'SELL';

    let size: 'SMALL' | 'MEDIUM' | 'LARGE';
    if (confidence >= 85) size = 'LARGE';
    else if (confidence >= 75) size = 'MEDIUM';
    else size = 'SMALL';

    return {
      action,
      asset,
      direction,
      size,
      reasoning: `预测市场显示 ${eventTitle} 的 ${signalType} 信号，置信度 ${confidence}%`,
    };
  }
}
