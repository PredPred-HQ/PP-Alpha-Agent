/**
 * OKX Agent Trade Kit MCP Client
 * 通过 MCP 协议与 OKX 交易所交互
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

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
 * OKX MCP Client
 * 封装 Agent Trade Kit 的 MCP 调用
 */
export class OKXMCPClient {
  private client: Client | null = null;
  private config: OKXConfig;
  private connected = false;

  constructor(config: OKXConfig) {
    this.config = config;
  }

  /**
   * 连接到 OKX MCP Server
   */
  async connect(): Promise<void> {
    if (this.connected) return;

    const transport = new StdioClientTransport({
      command: 'npx',
      args: [
        '-y',
        '@anthropic-ai/mcp-server-okx',
        '--api-key', this.config.apiKey,
        '--secret-key', this.config.secretKey,
        '--passphrase', this.config.passphrase,
        ...(this.config.simulated ? ['--simulated'] : []),
      ],
    });

    this.client = new Client({
      name: 'predict-alpha',
      version: '1.0.0',
    }, {
      capabilities: {},
    });

    await this.client.connect(transport);
    this.connected = true;
    console.log('[OKX] MCP client connected');
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.connected = false;
    }
  }

  /**
   * 调用 MCP 工具
   */
  private async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    if (!this.client) {
      throw new Error('MCP client not connected');
    }

    const result = await this.client.callTool({ name, arguments: args });
    return result;
  }

  // ============ 账户模块 ============

  /**
   * 获取账户余额
   */
  async getBalance(): Promise<AccountBalance> {
    const result = await this.callTool('okx_get_balance', {});
    return result as AccountBalance;
  }

  /**
   * 获取持仓信息
   */
  async getPositions(instType: 'SPOT' | 'MARGIN' | 'SWAP' | 'FUTURES' = 'SWAP'): Promise<Position[]> {
    const result = await this.callTool('okx_get_positions', { instType });
    return result as Position[];
  }

  // ============ 交易模块 ============

  /**
   * 下单
   */
  async placeOrder(order: TradeOrder): Promise<OrderResult> {
    const result = await this.callTool('okx_place_order', order);
    return result as OrderResult;
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
   * 开多仓 (合约)
   */
  async openLong(
    instId: string,
    size: string,
    lever: number = 3
  ): Promise<OrderResult> {
    // 先设置杠杆
    await this.callTool('okx_set_leverage', {
      instId,
      lever: String(lever),
      mgnMode: 'cross',
    });

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
    await this.callTool('okx_set_leverage', {
      instId,
      lever: String(lever),
      mgnMode: 'cross',
    });

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
    const result = await this.callTool('okx_close_position', {
      instId,
      mgnMode: 'cross',
      posSide,
    });
    return result as OrderResult;
  }

  /**
   * 取消订单
   */
  async cancelOrder(instId: string, ordId: string): Promise<OrderResult> {
    const result = await this.callTool('okx_cancel_order', {
      instId,
      ordId,
    });
    return result as OrderResult;
  }

  // ============ 市场数据模块 ============

  /**
   * 获取行情
   */
  async getTicker(instId: string): Promise<{
    last: string;
    askPx: string;
    bidPx: string;
    vol24h: string;
    volCcy24h: string;
  }> {
    const result = await this.callTool('okx_get_ticker', { instId });
    return result as any;
  }

  /**
   * 获取K线数据
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
    const result = await this.callTool('okx_get_candles', {
      instId,
      bar,
      limit: String(limit),
    });
    return result as any;
  }

  // ============ 策略模块 ============

  /**
   * 创建网格策略
   */
  async createGridBot(params: {
    instId: string;
    algoOrdType: 'grid';
    maxPx: string;
    minPx: string;
    gridNum: string;
    runType: '1' | '2'; // 1: 等差, 2: 等比
    sz: string;
  }): Promise<{ algoId: string }> {
    const result = await this.callTool('okx_create_grid_algo', params);
    return result as { algoId: string };
  }

  /**
   * 停止网格策略
   */
  async stopGridBot(algoId: string, instId: string): Promise<void> {
    await this.callTool('okx_stop_grid_algo', { algoId, instId });
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
    const result = await this.callTool('okx_set_tp_sl', {
      ...params,
      tdMode: 'cross',
    });
    return result as { algoId: string };
  }
}
