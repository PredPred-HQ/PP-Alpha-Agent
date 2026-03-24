/**
 * Polymarket API Client
 * 获取预测市场数据
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { getSimulatedEvents, MOCK_EVENTS } from './mock-data.js';

// Retry helper
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 2000
): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const isTimeout = (error as AxiosError).code === 'ECONNABORTED';
      const isNetworkError = (error as AxiosError).code === 'ENOTFOUND';

      if (i < retries - 1 && (isTimeout || isNetworkError)) {
        console.log(`[Polymarket] Retry ${i + 1}/${retries} after ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        delay *= 1.5; // exponential backoff
      }
    }
  }
  throw lastError;
}

// Types
export interface PolymarketEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  active: boolean;
  closed: boolean;
  liquidity: number;
  volume: number;
  markets: PolymarketMarket[];
  tags: string[];
}

export interface PolymarketMarket {
  id: string;
  question: string;
  slug: string;
  outcomePrices: string; // JSON string like '["0.65","0.35"]'
  outcomes: string; // JSON string like '["Yes","No"]'
  volume: number;
  liquidity: number;
  active: boolean;
  closed: boolean;
  conditionId: string;
  tokens: MarketToken[];
}

export interface MarketToken {
  token_id: string;
  outcome: string;
  price: number;
}

export interface MarketPrice {
  tokenId: string;
  price: number;
  side: 'BUY' | 'SELL';
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  midpoint: number;
}

export interface OrderBookLevel {
  price: number;
  size: number;
}

// Client
export class PolymarketClient {
  private gammaApi: AxiosInstance;
  private clobApi: AxiosInstance;
  private useMockData: boolean;

  constructor(
    gammaUrl = 'https://gamma-api.polymarket.com',
    clobUrl = 'https://clob.polymarket.com',
    useMockData = false
  ) {
    this.useMockData = useMockData || process.env.USE_MOCK_DATA === 'true';

    this.gammaApi = axios.create({
      baseURL: gammaUrl,
      timeout: 60000, // 60 seconds
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.clobApi = axios.create({
      baseURL: clobUrl,
      timeout: 60000, // 60 seconds
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (this.useMockData) {
      console.log('[Polymarket] Using mock data mode');
    }
  }

  /**
   * 获取活跃事件列表
   */
  async getEvents(options: {
    limit?: number;
    offset?: number;
    closed?: boolean;
    tag?: string;
    liquidityMin?: number;
  } = {}): Promise<PolymarketEvent[]> {
    // 使用模拟数据
    if (this.useMockData) {
      console.log('[Polymarket] Returning mock events');
      let events = getSimulatedEvents();

      if (options.closed === false) {
        events = events.filter(e => !e.closed);
      }
      if (options.liquidityMin) {
        events = events.filter(e => e.liquidity >= options.liquidityMin!);
      }
      if (options.limit) {
        events = events.slice(0, options.limit);
      }
      return events;
    }

    // 真实 API 调用
    const params = new URLSearchParams();
    params.set('order', 'id');
    params.set('ascending', 'false');
    params.set('limit', String(options.limit ?? 100));
    params.set('offset', String(options.offset ?? 0));

    if (options.closed !== undefined) {
      params.set('closed', String(options.closed));
    }
    if (options.tag) {
      params.set('tag', options.tag);
    }
    if (options.liquidityMin) {
      params.set('liquidity_min', String(options.liquidityMin));
    }

    return withRetry(async () => {
      const response = await this.gammaApi.get(`/events?${params.toString()}`);
      return response.data;
    });
  }

  /**
   * 获取热门加密货币相关事件
   */
  async getCryptoEvents(limit = 50): Promise<PolymarketEvent[]> {
    const events = await this.getEvents({
      limit,
      closed: false,
      liquidityMin: 10000, // 至少 $10k 流动性
    });

    // 过滤加密货币相关事件
    const cryptoKeywords = [
      'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'blockchain',
      'sec', 'etf', 'fed', 'rate', 'inflation', 'gdp', 'recession'
    ];

    return events.filter(event => {
      const text = `${event.title} ${event.description}`.toLowerCase();
      return cryptoKeywords.some(keyword => text.includes(keyword));
    });
  }

  /**
   * 获取单个事件详情
   */
  async getEvent(slug: string): Promise<PolymarketEvent> {
    const response = await this.gammaApi.get(`/events/slug/${slug}`);
    return response.data;
  }

  /**
   * 获取市场详情
   */
  async getMarket(slug: string): Promise<PolymarketMarket> {
    const response = await this.gammaApi.get(`/markets/slug/${slug}`);
    return response.data;
  }

  /**
   * 获取市场价格 (CLOB API)
   */
  async getPrice(tokenId: string, side: 'BUY' | 'SELL' = 'BUY'): Promise<number> {
    const response = await this.clobApi.get('/price', {
      params: { token_id: tokenId, side },
    });
    return parseFloat(response.data.price);
  }

  /**
   * 获取市场中间价
   */
  async getMidpoint(tokenId: string): Promise<number> {
    const response = await this.clobApi.get('/midpoint', {
      params: { token_id: tokenId },
    });
    return parseFloat(response.data.mid);
  }

  /**
   * 获取订单簿
   */
  async getOrderBook(tokenId: string): Promise<OrderBook> {
    const response = await this.clobApi.get('/book', {
      params: { token_id: tokenId },
    });

    const data = response.data;
    const bids = (data.bids || []).map((b: any) => ({
      price: parseFloat(b.price),
      size: parseFloat(b.size),
    }));
    const asks = (data.asks || []).map((a: any) => ({
      price: parseFloat(a.price),
      size: parseFloat(a.size),
    }));

    const bestBid = bids[0]?.price ?? 0;
    const bestAsk = asks[0]?.price ?? 1;

    return {
      bids,
      asks,
      spread: bestAsk - bestBid,
      midpoint: (bestBid + bestAsk) / 2,
    };
  }

  /**
   * 解析市场价格
   */
  parseMarketPrices(market: PolymarketMarket): { yes: number; no: number } {
    try {
      const prices = JSON.parse(market.outcomePrices);
      return {
        yes: parseFloat(prices[0]),
        no: parseFloat(prices[1]),
      };
    } catch {
      return { yes: 0.5, no: 0.5 };
    }
  }
}

export const polymarket = new PolymarketClient();
