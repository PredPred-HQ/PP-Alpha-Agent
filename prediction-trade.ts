import 'dotenv/config';
import { OKXMCPClient } from './src/okx/mcp-client.js';
import { PolymarketClient } from './src/polymarket/client.js';
import { SignalGenerator } from './src/polymarket/signals.js';

// 交易配置
const MAX_POSITION_SIZE = 1000; // 1000 USDT

async function executePredictionBasedTrade() {
  console.log('=== 执行基于预测的交易 ===\n');
  
  const okx = new OKXMCPClient({
    apiKey: process.env.OKX_API_KEY || '',
    secretKey: process.env.OKX_SECRET_KEY || '',
    passphrase: process.env.OKX_PASSPHRASE || '',
    simulated: process.env.OKX_SIMULATED === 'true',
  });

  const polymarket = new PolymarketClient();
  const signalGenerator = new SignalGenerator(polymarket);

  try {
    await okx.connect();
    
    // 获取账户信息
    console.log('1. 获取账户信息...');
    const balance = await okx.getBalance();
    console.log(`   账户总权益: ${parseFloat(balance.totalEq).toFixed(2)} USDT`);
    
    // 获取Polymarket信号
    console.log('\n2. 扫描Polymarket预测信号...');
    const signals = await signalGenerator.scanForSignals();
    console.log(`   找到 ${signals.length} 个信号\n`);
    
    if (signals.length === 0) {
      console.log('   未找到有效交易信号，退出...');
      return;
    }
    
    // 选择置信度最高的信号
    const topSignal = signals[0];
    console.log(`3. 分析最高置信度信号:`);
    console.log(`   事件: ${topSignal.eventTitle}`);
    console.log(`   问题: ${topSignal.marketQuestion}`);
    console.log(`   YES价格: ${(topSignal.yesPrice * 100).toFixed(1)}%`);
    console.log(`   信号类型: ${topSignal.signalType}`);
    console.log(`   置信度: ${topSignal.confidence}%`);
    console.log(`   相关资产: ${topSignal.relatedAssets.join(', ')}`);
    console.log(`   建议操作: ${topSignal.suggestedAction.action} ${topSignal.suggestedAction.asset}`);
    
    // 基于信号执行交易
    if (topSignal.signalType === 'BULLISH') {
      console.log('\n4. 执行交易决策 (做多) ...');
      
      // 获取市场价格
      const ticker = await okx.getTicker(`${topSignal.relatedAssets[0]}-USDT`);
      const currentPrice = parseFloat(ticker.last);
      console.log(`   ${topSignal.relatedAssets[0]} 当前价格: $${currentPrice.toLocaleString()}`);
      
      // 计算交易数量 (1000 USDT)
      const amountUSD = Math.min(MAX_POSITION_SIZE, parseFloat(balance.availBal)); // 限制在可用余额内
      const quantity = amountUSD / currentPrice;
      
      console.log(`   交易金额: $${amountUSD.toFixed(2)} USDT`);
      console.log(`   交易数量: ${quantity.toFixed(6)} ${topSignal.relatedAssets[0]}`);
      
      // 执行交易
      console.log(`\n5. 执行 ${topSignal.relatedAssets[0]} 买入 ...`);
      const order = await okx.marketBuy(`${topSignal.relatedAssets[0]}-USDT`, quantity.toString(), 'cash');
      
      console.log('   ✅ 买入订单提交成功!');
      console.log(`   订单ID: ${order.ordId}`);
      console.log(`   状态: ${order.sCode} - ${order.sMsg}`);
      
      // 检查订单状态
      console.log('\n6. 交易执行完成');
    } else if (topSignal.signalType === 'BEARISH') {
      console.log('\n4. 执行交易决策 (做空) ...');
      
      // 获取市场价格
      const ticker = await okx.getTicker(`${topSignal.relatedAssets[0]}-USDT-SWAP`);
      const currentPrice = parseFloat(ticker.last);
      console.log(`   ${topSignal.relatedAssets[0]}-USDT-SWAP 当前价格: $${currentPrice.toLocaleString()}`);
      
      // 计算交易数量 (1000 USDT)
      const amountUSD = Math.min(MAX_POSITION_SIZE, parseFloat(balance.availBal));
      const quantity = (amountUSD / currentPrice) * 0.01; // 按百分比计算合约张数
      
      console.log(`   交易金额: $${amountUSD.toFixed(2)} USDT`);
      console.log(`   交易数量: ${quantity.toFixed(4)} 张`);
      
      // 执行交易 (开空)
      console.log(`\n5. 执行 ${topSignal.relatedAssets[0]} 合约做空 ...`);
      const order = await okx.openShort(`${topSignal.relatedAssets[0]}-USDT-SWAP`, quantity.toString(), 3);
      
      console.log('   ✅ 做空订单提交成功!');
      console.log(`   订单ID: ${order.ordId}`);
      console.log(`   状态: ${order.sCode} - ${order.sMsg}`);
      
      console.log('\n6. 交易执行完成');
    } else {
      console.log('\n4. 信号为中性，暂不执行交易');
    }
    
    // 最终账户状态
    console.log('\n7. 最终账户状态:');
    const finalBalance = await okx.getBalance();
    console.log(`   账户总权益: ${parseFloat(finalBalance.totalEq).toFixed(2)} USDT`);
    
    await okx.disconnect();
    console.log('\n=== 交易流程完成 ===');
  } catch (error) {
    console.error('交易执行失败:', error.message);
    await okx.disconnect();
  }
}

executePredictionBasedTrade();