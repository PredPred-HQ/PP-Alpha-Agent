/**
 * 模拟交易测试脚本
 * 在 OKX 模拟账户上执行测试交易
 */

import 'dotenv/config';
import { OKXMCPClient } from '../src/okx/mcp-client.js';

const okx = new OKXMCPClient({
  apiKey: process.env.OKX_API_KEY || '',
  secretKey: process.env.OKX_SECRET_KEY || '',
  passphrase: process.env.OKX_PASSPHRASE || '',
  simulated: process.env.OKX_SIMULATED === 'true',
});

async function main() {
  console.log('=== OKX 模拟交易测试 ===\n');
  console.log(`模拟模式: ${process.env.OKX_SIMULATED === 'true' ? 'YES ✅' : 'NO ⚠️'}\n`);

  try {
    // 1. 连接并获取余额
    console.log('1. 连接 OKX API...');
    await okx.connect();

    const balance = await okx.getBalance();
    console.log(`   账户余额: ${parseFloat(balance.totalEq).toFixed(2)} USDT\n`);

    // 2. 获取 BTC 行情
    console.log('2. 获取 BTC-USDT 行情...');
    const ticker = await okx.getTicker('BTC-USDT');
    console.log(`   最新价格: $${parseFloat(ticker.last).toLocaleString()}`);
    console.log(`   买一价: $${ticker.bidPx}`);
    console.log(`   卖一价: $${ticker.askPx}\n`);

    // 3. 获取 BTC 合约行情
    console.log('3. 获取 BTC-USDT-SWAP 永续合约行情...');
    const swapTicker = await okx.getTicker('BTC-USDT-SWAP');
    console.log(`   最新价格: $${parseFloat(swapTicker.last).toLocaleString()}\n`);

    // 4. 测试下单 (现货买入 0.001 BTC)
    console.log('4. 测试现货买入 0.001 BTC...');
    try {
      const spotOrder = await okx.marketBuy('BTC-USDT', '0.001', 'cash');
      console.log(`   ✅ 订单成功! ordId: ${spotOrder.ordId}`);
      console.log(`   状态码: ${spotOrder.sCode}, 消息: ${spotOrder.sMsg}\n`);
    } catch (error: any) {
      console.log(`   ❌ 订单失败: ${error.response?.data?.msg || error.message}\n`);
    }

    // 5. 测试合约开多 (0.01 张)
    console.log('5. 测试合约开多 BTC-USDT-SWAP 0.01 张 (3x杠杆)...');
    try {
      const longOrder = await okx.openLong('BTC-USDT-SWAP', '0.01', 3);
      console.log(`   ✅ 开多成功! ordId: ${longOrder.ordId}`);
      console.log(`   状态码: ${longOrder.sCode}, 消息: ${longOrder.sMsg}\n`);
    } catch (error: any) {
      console.log(`   ❌ 开多失败: ${error.response?.data?.msg || error.message}\n`);
    }

    // 6. 查看持仓
    console.log('6. 查看当前持仓...');
    const positions = await okx.getPositions('SWAP');
    if (positions.length === 0) {
      console.log('   无持仓\n');
    } else {
      for (const pos of positions) {
        if (parseFloat(pos.pos) !== 0) {
          console.log(`   ${pos.instId} ${pos.posSide}: ${pos.pos} 张`);
          console.log(`   均价: $${pos.avgPx}, 未实现盈亏: ${pos.upl}\n`);
        }
      }
    }

    // 7. 测试平仓 (如果有持仓)
    const hasPosition = positions.some(p => parseFloat(p.pos) !== 0);
    if (hasPosition) {
      console.log('7. 测试平仓...');
      try {
        const closeResult = await okx.closePosition('BTC-USDT-SWAP', 'long');
        console.log(`   ✅ 平仓成功! ${closeResult.sMsg}\n`);
      } catch (error: any) {
        console.log(`   ❌ 平仓失败: ${error.response?.data?.msg || error.message}\n`);
      }
    }

    console.log('=== 测试完成 ===');

  } catch (error: any) {
    console.error('错误:', error.response?.data || error.message);
  } finally {
    await okx.disconnect();
  }
}

main();
