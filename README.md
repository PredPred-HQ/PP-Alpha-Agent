# PP-Alpha-Agent - Prediction-Powered Trading Agent

> 🏆 OKX AI Song Hackathon 2026 参赛作品

将 Polymarket 预测市场的群体智慧转化为 OKX 交易信号的智能代理。

## 核心理念

预测市场是"群体智慧"的最佳体现 —— 当数百万美元的真金白银押注在某个事件上时，其价格本身就是最准确的概率预测。PP-Alpha-Agent 将这种群体智慧转化为可执行的交易信号。

```
┌─────────────────────────────────────────────────────────────┐
│                      PP-Alpha-Agent                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐  │
│  │ Polymarket  │ ───► │  AI Agent   │ ───► │    OKX      │  │
│  │  预测市场   │      │  (Qwen)     │      │  交易执行   │  │
│  └─────────────┘      └─────────────┘      └─────────────┘  │
│                                                             │
│  • 市场情绪信号         • 信号分析           • 现货交易    │
│  • YES/NO 价格          • 策略生成           • 合约交易    │
│  • 成交量变化           • 风险评估           • 网格策略    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 功能特性

### 1. 预测信号采集
- 实时获取 Polymarket 市场数据
- 监控 YES/NO 价格变化
- 追踪成交量和流动性异动

### 2. 智能信号分析
- 基于预测市场情绪生成交易信号
- 多维度评分系统（置信度、流动性、时效性）
- 历史准确率追踪

### 3. OKX 自动化交易
- 通过 Agent Trade Kit MCP 执行交易
- 支持现货、合约、网格策略
- 内置风控和仓位管理

## 快速开始

### 环境要求

- Node.js >= 18
- OKX API 密钥
- 阿里百炼 API 密钥 (或 OpenAI/Anthropic)

### 安装

```bash
# 克隆项目
git clone https://github.com/PredPred-HQ/PP-Alpha-Agent.git
cd PP-Alpha-Agent

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
```

### 配置

```bash
# .env 文件

# OKX 交易所配置
OKX_API_KEY=your_api_key
OKX_SECRET_KEY=your_secret_key
OKX_PASSPHRASE=your_passphrase
OKX_SIMULATED=true  # 模拟交易模式

# 阿里百炼 Qwen API (推荐)
DASHSCOPE_API_KEY=your_dashscope_api_key
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_MODEL=qwen-plus

# 或使用 OpenAI
# OPENAI_API_KEY=your_openai_api_key
# OPENAI_MODEL=gpt-4o

# 或使用 Anthropic Claude
# ANTHROPIC_API_KEY=your_anthropic_api_key
# ANTHROPIC_MODEL=claude-sonnet-4-5-20250929
```

### 运行

```bash
# 启动 Agent
npm run start

# 仅监控模式（不执行交易）
npm run monitor

# 回测模式
npm run backtest
```

## 策略示例

### 1. 事件驱动策略
```
场景：美联储利率决议预测市场

Polymarket 显示：
- "Fed 将在3月降息" YES 价格从 0.35 → 0.65
- 成交量激增 500%

Agent 行动：
1. 检测到强烈降息预期信号
2. 通过 OKX 开多 BTC 合约（降息利好风险资产）
3. 设置止损止盈
4. 事件结果公布后自动平仓
```

### 2. 情绪反转策略
```
场景：加密货币监管预测市场

Polymarket 显示：
- "SEC 将批准 ETH ETF" YES 价格连续3天下跌
- 大户持仓减少

Agent 行动：
1. 检测到市场情绪转向悲观
2. 减仓 ETH 现货
3. 或建立对冲仓位
```

## 项目结构

```
pp-alpha-agent/
├── src/
│   ├── polymarket/      # Polymarket API 客户端
│   ├── okx/             # OKX Agent Trade Kit 集成
│   ├── agent/           # AI Agent 核心逻辑
│   └── strategies/      # 交易策略
├── config/              # 配置文件
├── scripts/             # 工具脚本
└── docs/                # 文档
```

## 技术栈

- **数据源**: Polymarket Gamma API + CLOB API
- **交易执行**: OKX REST API (模拟/实盘)
- **AI 引擎**: 阿里百炼 Qwen (支持 OpenAI/Claude)
- **语言**: TypeScript

## API 参考

### Polymarket
- Gamma API: `https://gamma-api.polymarket.com`
- CLOB API: `https://clob.polymarket.com`

### OKX Agent Trade Kit
- MCP Server: 8大模块，121种工具
- 支持：现货、合约、期权、网格策略

## License

MIT

## 团队

PredP.red AI Operations Team
