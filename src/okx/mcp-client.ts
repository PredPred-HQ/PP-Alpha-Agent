/**
 * OKX Agent Trade Kit Client
 * 通过 REST API 与 OKX 交易所交互
 *
 * 注意: MCP 模式需要先安装 @okx_ai/okx-trade-mcp 并运行 `okx config init`
 * 这里提供 REST API 作为备选方案
 */

import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

export interface OKXConfig {
  apiKey: string;
  secretKey: string;
  passphrase: string;
  simulated?: boolean;
}

export interface TradeOrder {
  instId: string; // 交易对，如 BTC-USDT
  side: 'buy' | 'sell';
  ordType: 'market' | 'limit' | 'post_only';
  sz: string; // 数量
  px?: string; // 限价单价格
  tdMode: 'cash' | 'cross' | 'isolated'; // 交易模式
  posSide?: 'long' | 'short'; // 合约持仓方向
}

export interface OrderResult {
  ordId: string;
  clOrdId: string;
  sCode: string;
  sMsg: string;
}

export interface Position {
  instId: string;
  posSide: 'long' | 'short' | 'net';
  pos: string;
  avgPx: string;
  upl: string;
  lever: string;
}

export interface AccountBalance {
  totalEq: string;
  availBal: string;
  frozenBal: string;
}

/**
 * OKX REST API Client
 * 直接使用 OKX REST API
 */
export class OKXMCPClient {
  private api: AxiosInstance;
  private config: OKXConfig;
  private connected = false;

  constructor(config: OKXConfig) {
    this.config = config;

    const baseURL = config.simulated
      ? 'https://www.okx.com' // Demo 模式也用同一个域名，通过 header 区分
      : 'https://www.okx.com';

    this.api = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * 生成签名
   */
  private sign(timestamp: string, method: string, path: string, body: string = ''): string {
    const prehash = timestamp + method + path + body;
    return crypto
      .createHmac('sha256', this.config.secretKey)
      .update(prehash)
      .digest('base64');
  }

  /**
   * 获取请求头
   */
  private getHeaders(method: string, path: string, body: string = ''): Record<string, string> {
    const timestamp = new Date().toISOString();
    const sign = this.sign(timestamp, method, path, body);

    return {
      'OK-ACCESS-KEY': this.config.apiKey,
      'OK-ACCESS-SIGN': sign,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': this.config.passphrase,
      ...(this.config.simulated ? { 'x-simulated-trading': '1' } : {}),
    };
  }

  /**
   * 发送 GET 请求
   */
  private async get<T>(path: string): Promise<T> {
    const headers = this.getHeaders('GET', path);
    const response = await this.api.get(path, { headers });
    return response.data.data;
  }

  /**
   * 发送 POST 请求
   */
  private async post<T>(path: string, data: Record<string, unknown>): Promise<T> {
    const body = JSON.stringify(data);
    const headers = this.getHeaders('POST', path, body);
    const response = await this.api.post(path, data, { headers });
    return response.data.data;
  }

  /**
   * 连接（REST API 无需真正连接）
   */
  async connect(): Promise<void> {
    if (this.connected) return;

    // 验证 API 连接
    try {
      await this.getBalance();
      this.connected = true;
      console.log('[OKX] REST API connected');
    } catch (error: any) {
      console.error('[OKX] Connection failed:', error.message);
      // 在 demo 模式下继续运行
      if (this.config.simulated) {
        this.connected = true;
        console.log('[OKX] Running in simulated mode');
      } else {
        throw error;
      }
    }
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    this.connected = false;
    console.log('[OKX] Disconnected');
  }

  // ============ 账户模块 ============

  /**
   * 获取账户余额
   */
  async getBalance(): Promise<AccountBalance> {
    const data = await this.get<any[]>('/api/v5/account/balance');
    if (data && data[0]) {
      return {
        totalEq: data[0].totalEq || '0',
        availBal: data[0].details?.[0]?.availBal || '0',
        frozenBal: data[0].details?.[0]?.frozenBal || '0',
      };
    }
    return { totalEq: '0', availBal: '0', frozenBal: '0' };
  }

  /**
   * 获取持仓信息
   */
  async getPositions(instType: 'SPOT' | 'MARGIN' | 'SWAP' | 'FUTURES' = 'SWAP'): Promise<Position[]> {
    const data = await this.get<any[]>(`/api/v5/account/positions?instType=${instType}`);
    return (data || []).map((p: any) => ({
      instId: p.instId,
      posSide: p.posSide,
      pos: p.pos,
      avgPx: p.avgPx,
      upl: p.upl,
      lever: p.lever,
    }));
  }

  // ============ 交易模块 ============

  /**
   * 下单
   */
  async placeOrder(order: TradeOrder): Promise<OrderResult> {
    const data = await this.post<any[]>('/api/v5/trade/order', order);
    if (data && data[0]) {
      return {
        ordId: data[0].ordId,
        clOrdId: data[0].clOrdId || '',
        sCode: data[0].sCode,
        sMsg: data[0].sMsg,
      };
    }
    throw new Error('Order failed');
  }

  /**
   * 市价买入
   */
  async marketBuy(
    instId: string,
    size: string,
    tdMode: 'cash' | 'cross' = 'cash'
  ): Promise<OrderResult> {
    return this.placeOrder({
      instId,
      side: 'buy',
      ordType: 'market',
      sz: size,
      tdMode,
    });
  }

  /**
   * 市价卖出
   */
  async marketSell(
    instId: string,
    size: string,
    tdMode: 'cash' | 'cross' = 'cash'
  ): Promise<OrderResult> {
    return this.placeOrder({
      instId,
      side: 'sell',
      ordType: 'market',
      sz: size,
      tdMode,
    });
  }

  /**
   * 设置杠杆
   */
  async setLeverage(instId: string, lever: number, mgnMode: 'cross' | 'isolated' = 'cross'): Promise<void> {
    await this.post('/api/v5/account/set-leverage', {
      instId,
      lever: String(lever),
      mgnMode,
    });
  }

  /**
   * 开多仓 (合约)
   */
  async openLong(
    instId: string,
    size: string,
    lever: number = 3
  ): Promise<OrderResult> {
    await this.setLeverage(instId, lever, 'cross');

    return this.placeOrder({
      instId,
      side: 'buy',
      ordType: 'market',
      sz: size,
      tdMode: 'cross',
      posSide: 'long',
    });
  }

  /**
   * 开空仓 (合约)
   */
  async openShort(
    instId: string,
    size: string,
    lever: number = 3
  ): Promise<OrderResult> {
    await this.setLeverage(instId, lever, 'cross');

    return this.placeOrder({
      instId,
      side: 'sell',
      ordType: 'market',
      sz: size,
      tdMode: 'cross',
      posSide: 'short',
    });
  }

  /**
   * 平仓
   */
  async closePosition(
    instId: string,
    posSide: 'long' | 'short'
  ): Promise<OrderResult> {
    const data = await this.post<any[]>('/api/v5/trade/close-position', {
      instId,
      mgnMode: 'cross',
      posSide,
    });
    if (data && data[0]) {
      return {
        ordId: data[0].ordId || '',
        clOrdId: '',
        sCode: data[0].sCode || '0',
        sMsg: data[0].sMsg || 'success',
      };
    }
    throw new Error('Close position failed');
  }

  /**
   * 取消订单
   */
  async cancelOrder(instId: string, ordId: string): Promise<OrderResult> {
    const data = await this.post<any[]>('/api/v5/trade/cancel-order', {
      instId,
      ordId,
    });
    if (data && data[0]) {
      return {
        ordId: data[0].ordId,
        clOrdId: data[0].clOrdId || '',
        sCode: data[0].sCode,
        sMsg: data[0].sMsg,
      };
    }
    throw new Error('Cancel order failed');
  }

  // ============ 市场数据模块 ============

  /**
   * 获取行情（公开接口，无需签名）
   */
  async getTicker(instId: string): Promise<{
    last: string;
    askPx: string;
    bidPx: string;
    vol24h: string;
    volCcy24h: string;
  }> {
    const response = await this.api.get(`/api/v5/market/ticker?instId=${instId}`);
    const data = response.data.data;
    if (data && data[0]) {
      return {
        last: data[0].last,
        askPx: data[0].askPx,
        bidPx: data[0].bidPx,
        vol24h: data[0].vol24h,
        volCcy24h: data[0].volCcy24h,
      };
    }
    throw new Error('Ticker not found');
  }

  /**
   * 获取K线数据（公开接口）
   */
  async getCandles(
    instId: string,
    bar: '1m' | '5m' | '15m' | '1H' | '4H' | '1D' = '1H',
    limit: number = 100
  ): Promise<Array<{
    ts: string;
    o: string;
    h: string;
    l: string;
    c: string;
    vol: string;
  }>> {
    const response = await this.api.get(
      `/api/v5/market/candles?instId=${instId}&bar=${bar}&limit=${limit}`
    );
    const data = response.data.data || [];
    return data.map((candle: string[]) => ({
      ts: candle[0],
      o: candle[1],
      h: candle[2],
      l: candle[3],
      c: candle[4],
      vol: candle[5],
    }));
  }

  // ============ 止盈止损模块 ============

  /**
   * 设置止盈止损
   */
  async setTpSl(params: {
    instId: string;
    posSide: 'long' | 'short';
    tpTriggerPx?: string;
    tpOrdPx?: string;
    slTriggerPx?: string;
    slOrdPx?: string;
  }): Promise<{ algoId: string }> {
    const data = await this.post<any[]>('/api/v5/trade/order-algo', {
      instId: params.instId,
      tdMode: 'cross',
      posSide: params.posSide,
      ordType: 'conditional',
      sz: '0', // 全部持仓
      tpTriggerPx: params.tpTriggerPx,
      tpOrdPx: params.tpOrdPx || '-1', // -1 表示市价
      slTriggerPx: params.slTriggerPx,
      slOrdPx: params.slOrdPx || '-1',
    });
    if (data && data[0]) {
      return { algoId: data[0].algoId };
    }
    throw new Error('Set TP/SL failed');
  }
}
