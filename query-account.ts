import 'dotenv/config';
import { OKXMCPClient } from './src/okx/mcp-client.js';

async function checkAccount() {
  const okx = new OKXMCPClient({
    apiKey: process.env.OKX_API_KEY || '',
    secretKey: process.env.OKX_SECRET_KEY || '',
    passphrase: process.env.OKX_PASSPHRASE || '',
    simulated: process.env.OKX_SIMULATED === 'true',
  });

  try {
    await okx.connect();
    
    // 获取账户余额
    console.log('=== OKX 模拟盘账户信息 ===');
    const balance = await okx.getBalance();
    console.log(`账户总权益: ${parseFloat(balance.totalEq).toFixed(2)} USDT`);
    console.log(`可用余额: ${parseFloat(balance.availBal).toFixed(2)} USDT`);
    console.log(`冻结金额: ${parseFloat(balance.frozenBal).toFixed(2)} USDT`);

    // 获取持仓信息
    console.log('\n=== 持仓信息 ===');
    const positions = await okx.getPositions('SWAP');
    if (positions.length === 0 || positions.every(p => parseFloat(p.pos) === 0)) {
      console.log('当前无持仓');
    } else {
      for (const pos of positions) {
        const posAmt = parseFloat(pos.pos);
        if (posAmt !== 0) {
          console.log(`合约: ${pos.instId}`);
          console.log(`持仓方向: ${pos.posSide}`);
          console.log(`持仓数量: ${pos.pos} 张`);
          console.log(`平均价格: $${parseFloat(pos.avgPx).toFixed(2)}`);
          console.log(`未实现盈亏: ${pos.upl} USDT`);
          console.log(`杠杆倍数: ${pos.lever}x`);
          console.log('');
        }
      }
    }
    
    await okx.disconnect();
  } catch (error) {
    console.error('查询失败:', error.message);
  }
}

checkAccount();