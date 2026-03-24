#!/bin/bash

# PP-Alpha-Agent Demo Script
# 用于演示视频录制

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║              PP-Alpha-Agent Demo                          ║"
echo "║         Prediction-Powered Trading Agent                  ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# 检查依赖
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

# 检查环境变量
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "Warning: ANTHROPIC_API_KEY not set"
    echo "Using demo mode without Claude analysis"
fi

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# 运行 Demo 模式
echo ""
echo "Starting demo..."
echo ""

npm run start -- --mode=demo
