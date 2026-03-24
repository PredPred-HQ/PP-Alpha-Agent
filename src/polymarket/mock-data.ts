/**
 * Mock Polymarket Data
 * 用于演示和测试（当 API 不可用时）
 */

import { PolymarketEvent, PolymarketMarket } from './client.js';

export const MOCK_EVENTS: PolymarketEvent[] = [
  {
    id: '1001',
    slug: 'fed-rate-cut-march-2026',
    title: 'Will the Fed cut rates in March 2026?',
    description: 'This market resolves to Yes if the Federal Reserve announces a rate cut at the March 2026 FOMC meeting.',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-03-26T00:00:00Z',
    active: true,
    closed: false,
    liquidity: 2500000,
    volume: 8500000,
    tags: ['fed', 'macro', 'interest-rates'],
    markets: [
      {
        id: 'm1001',
        question: 'Will the Fed cut rates in March 2026?',
        slug: 'fed-rate-cut-march-2026',
        outcomePrices: '["0.72","0.28"]',
        outcomes: '["Yes","No"]',
        volume: 8500000,
        liquidity: 2500000,
        active: true,
        closed: false,
        conditionId: 'cond1001',
        tokens: [
          { token_id: 't1001-yes', outcome: 'Yes', price: 0.72 },
          { token_id: 't1001-no', outcome: 'No', price: 0.28 },
        ],
      },
    ],
  },
  {
    id: '1002',
    slug: 'btc-100k-by-april-2026',
    title: 'Will Bitcoin reach $100,000 by April 2026?',
    description: 'This market resolves to Yes if Bitcoin trades at or above $100,000 on any major exchange before April 1, 2026.',
    startDate: '2026-01-15T00:00:00Z',
    endDate: '2026-04-01T00:00:00Z',
    active: true,
    closed: false,
    liquidity: 5200000,
    volume: 15000000,
    tags: ['bitcoin', 'crypto', 'price'],
    markets: [
      {
        id: 'm1002',
        question: 'Will Bitcoin reach $100,000 by April 2026?',
        slug: 'btc-100k-by-april-2026',
        outcomePrices: '["0.65","0.35"]',
        outcomes: '["Yes","No"]',
        volume: 15000000,
        liquidity: 5200000,
        active: true,
        closed: false,
        conditionId: 'cond1002',
        tokens: [
          { token_id: 't1002-yes', outcome: 'Yes', price: 0.65 },
          { token_id: 't1002-no', outcome: 'No', price: 0.35 },
        ],
      },
    ],
  },
  {
    id: '1003',
    slug: 'eth-etf-approval-q1-2026',
    title: 'Will SEC approve Ethereum Spot ETF in Q1 2026?',
    description: 'This market resolves to Yes if the SEC approves at least one Ethereum Spot ETF application before April 1, 2026.',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-04-01T00:00:00Z',
    active: true,
    closed: false,
    liquidity: 3800000,
    volume: 12000000,
    tags: ['ethereum', 'etf', 'sec', 'regulation'],
    markets: [
      {
        id: 'm1003',
        question: 'Will SEC approve Ethereum Spot ETF in Q1 2026?',
        slug: 'eth-etf-approval-q1-2026',
        outcomePrices: '["0.81","0.19"]',
        outcomes: '["Yes","No"]',
        volume: 12000000,
        liquidity: 3800000,
        active: true,
        closed: false,
        conditionId: 'cond1003',
        tokens: [
          { token_id: 't1003-yes', outcome: 'Yes', price: 0.81 },
          { token_id: 't1003-no', outcome: 'No', price: 0.19 },
        ],
      },
    ],
  },
  {
    id: '1004',
    slug: 'us-recession-2026',
    title: 'Will the US enter a recession in 2026?',
    description: 'This market resolves to Yes if the NBER officially declares the US entered a recession during 2026.',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T00:00:00Z',
    active: true,
    closed: false,
    liquidity: 1800000,
    volume: 6500000,
    tags: ['recession', 'macro', 'economy'],
    markets: [
      {
        id: 'm1004',
        question: 'Will the US enter a recession in 2026?',
        slug: 'us-recession-2026',
        outcomePrices: '["0.35","0.65"]',
        outcomes: '["Yes","No"]',
        volume: 6500000,
        liquidity: 1800000,
        active: true,
        closed: false,
        conditionId: 'cond1004',
        tokens: [
          { token_id: 't1004-yes', outcome: 'Yes', price: 0.35 },
          { token_id: 't1004-no', outcome: 'No', price: 0.65 },
        ],
      },
    ],
  },
  {
    id: '1005',
    slug: 'sol-new-ath-march-2026',
    title: 'Will Solana reach new ATH in March 2026?',
    description: 'This market resolves to Yes if Solana trades above $295 (previous ATH) during March 2026.',
    startDate: '2026-03-01T00:00:00Z',
    endDate: '2026-03-31T00:00:00Z',
    active: true,
    closed: false,
    liquidity: 950000,
    volume: 3200000,
    tags: ['solana', 'crypto', 'price'],
    markets: [
      {
        id: 'm1005',
        question: 'Will Solana reach new ATH in March 2026?',
        slug: 'sol-new-ath-march-2026',
        outcomePrices: '["0.58","0.42"]',
        outcomes: '["Yes","No"]',
        volume: 3200000,
        liquidity: 950000,
        active: true,
        closed: false,
        conditionId: 'cond1005',
        tokens: [
          { token_id: 't1005-yes', outcome: 'Yes', price: 0.58 },
          { token_id: 't1005-no', outcome: 'No', price: 0.42 },
        ],
      },
    ],
  },
  {
    id: '1006',
    slug: 'inflation-below-3-march-2026',
    title: 'Will US CPI inflation drop below 3% in March 2026?',
    description: 'This market resolves to Yes if the March 2026 CPI year-over-year reading is below 3.0%.',
    startDate: '2026-02-01T00:00:00Z',
    endDate: '2026-04-15T00:00:00Z',
    active: true,
    closed: false,
    liquidity: 1200000,
    volume: 4800000,
    tags: ['inflation', 'cpi', 'macro'],
    markets: [
      {
        id: 'm1006',
        question: 'Will US CPI inflation drop below 3% in March 2026?',
        slug: 'inflation-below-3-march-2026',
        outcomePrices: '["0.68","0.32"]',
        outcomes: '["Yes","No"]',
        volume: 4800000,
        liquidity: 1200000,
        active: true,
        closed: false,
        conditionId: 'cond1006',
        tokens: [
          { token_id: 't1006-yes', outcome: 'Yes', price: 0.68 },
          { token_id: 't1006-no', outcome: 'No', price: 0.32 },
        ],
      },
    ],
  },
];

/**
 * 添加随机波动，使数据更真实
 */
export function getSimulatedEvents(): PolymarketEvent[] {
  return MOCK_EVENTS.map(event => ({
    ...event,
    markets: event.markets.map(market => {
      // 添加小幅随机波动 (-2% to +2%)
      const prices = JSON.parse(market.outcomePrices);
      const yesPrice = parseFloat(prices[0]);
      const fluctuation = (Math.random() - 0.5) * 0.04;
      const newYesPrice = Math.max(0.01, Math.min(0.99, yesPrice + fluctuation));
      const newNoPrice = 1 - newYesPrice;

      return {
        ...market,
        outcomePrices: `["${newYesPrice.toFixed(2)}","${newNoPrice.toFixed(2)}"]`,
        tokens: [
          { ...market.tokens[0], price: newYesPrice },
          { ...market.tokens[1], price: newNoPrice },
        ],
      };
    }),
  }));
}
