#!/bin/bash
# 推送TOKI APP到GitHub Pages，供手机访问

cd /home/tony/.openclaw/workspace/toki-app

echo "🚀 推送TOKI APP到GitHub Pages..."

# 检查Git状态
git status

# 添加所有更改
git add .

# 提交
git commit -m "接入智谱AI - 支持真实对话"

# 推送
git push origin main

echo "✅ 推送完成！"
echo ""
echo "📱 手机访问地址："
echo "主页：https://chaseqq123.github.io/toki-app/"
echo "语音助手：https://chaseqq123.github.io/toki-app/voice-assistant/"
