# PP-Alpha-Agent Demo 录制指南

## 项目概述

**PP-Alpha-Agent** - 将 Polymarket 预测市场的群体智慧转化为 OKX 交易信号的 AI 代理

```
Polymarket 预测市场 → AI 分析 (Claude/GPT) → OKX 自动交易
```

---

## Demo 录制流程

### 1. 展示项目架构 (30秒)

打开 README.md 展示核心架构图：
```bash
cat README.md
```

### 2. 运行 Demo 模式 (1分钟)

展示系统如何获取预测市场数据并生成交易信号：
```bash
npm run start -- --mode=demo
```

**演示要点:**
- Banner 展示项目名称
- 获取 5 个活跃预测市场事件
- 自动生成交易信号（包含置信度、相关资产、建议操作）

### 3. OKX 模拟交易测试 (1分钟)

展示真实的 OKX API 交互：
```bash
npm run test:trade
```

**演示要点:**
- 连接 OKX 模拟账户（显示账户余额）
- 获取 BTC 实时行情
- 执行合约开多/平仓操作
- 查看持仓信息

### 4. 监控模式 (30秒)

展示持续监控信号的能力：
```bash
npm run monitor
```
*(运行 10 秒后 Ctrl+C 退出)*

**演示要点:**
- 实时扫描预测市场
- 生成信号报告
- 建议的交易操作

### 5. 代码展示 (30秒)

快速展示关键代码：
- `src/agent/core.ts` - AI 决策引擎
- `src/okx/mcp-client.ts` - OKX 交易客户端
- `src/polymarket/signals.ts` - 信号生成器

---

## 快速命令

```bash
# Demo 模式 - 展示核心功能
npm run start -- --mode=demo

# 监控模式 - 仅显示信号不交易
npm run monitor

# 测试交易 - OKX 模拟账户
npm run test:trade

# 完整交易模式 (慎用)
npm start
```

---

## 当前配置

| 配置项 | 值 |
|-------|-----|
| AI 提供商 | Anthropic (Claude) |
| 交易模式 | 模拟 (Simulated) |
| 账户余额 | ~6017 USDT |
| 最大仓位 | $1000 |
| 最大杠杆 | 3x |
| 止损 | 5% |
| 止盈 | 10% |

---

## 亮点功能

1. **群体智慧** - 利用 Polymarket 真金白银押注的预测概率
2. **AI 决策** - Claude/GPT 分析信号，生成交易建议
3. **自动执行** - OKX REST API 自动下单、设置止盈止损
4. **风控内置** - 仓位限制、杠杆控制、自动止损

---

## Demo 脚本 (参考台词)

> "今天我要展示 PP-Alpha-Agent，一个将预测市场智慧转化为加密货币交易信号的 AI 代理。"
>
> "首先，系统从 Polymarket 获取预测市场数据。比如这里显示美联储降息概率是 72%，这对 BTC 是利好信号。"
>
> "AI Agent 分析这些信号，考虑置信度、流动性、紧急程度，然后通过 OKX API 自动执行交易。"
>
> "整个流程：预测市场数据 → AI 分析 → 自动交易，完全自主运行。"

---

## 录制前检查

- [x] 项目依赖已安装
- [x] 环境变量已配置
- [x] OKX 模拟账户连接正常
- [x] Demo 模式运行正常
- [x] 交易测试通过

**准备就绪，可以开始录制！** 🎬
