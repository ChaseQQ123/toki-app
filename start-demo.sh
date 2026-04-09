#!/bin/bash

# TOKI Demo 启动脚本

echo "🤖 TOKI - AI助手 Demo"
echo "====================="
echo ""

# 进入项目目录
cd /home/tony/.openclaw/workspace/toki-app/web-demo

# 检查端口
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 8080 已被占用"
    echo "尝试使用端口 8081..."
    PORT=8081
else
    PORT=8080
fi

echo "🌐 启动Web服务器..."
echo "📱 Demo地址: http://localhost:$PORT"
echo ""
echo "💡 提示："
echo "   - 按 Ctrl+C 停止服务器"
echo "   - 在浏览器中打开上述地址即可体验"
echo ""

# 启动服务器
python3 -m http.server $PORT
