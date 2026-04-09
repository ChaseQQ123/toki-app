#!/bin/bash

# TOKI 语音助手启动脚本

echo "🤖 TOKI 语音助手"
echo "================="
echo ""

# 进入项目目录
cd "$(dirname "$0")"

# 检查端口
PORT=8080
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  端口 $PORT 已被占用"
    echo "尝试使用端口 8081..."
    PORT=8081
fi

echo "🌐 启动Web服务器..."
echo "📱 访问地址: http://localhost:$PORT"
echo ""
echo "💡 提示："
echo "   - 使用Chrome浏览器获得最佳体验"
echo "   - 需要允许麦克风权限"
echo "   - 按 Ctrl+C 停止服务器"
echo ""

# 启动服务器
python3 -m http.server $PORT
