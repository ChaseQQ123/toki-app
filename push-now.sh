#!/bin/bash

# 一键推送到GitHub
# 执行后会提示输入GitHub用户名和密码（或token）

cd /home/tony/.openclaw/workspace/toki-app

echo "🚀 推送TOKI Demo到GitHub"
echo "========================"
echo ""
echo "GitHub用户名: ChaseQQ123"
echo "仓库地址: https://github.com/ChaseQQ123/toki-app"
echo ""
echo "⏱️  即将推送代码..."
echo ""

# 推送
git push -u origin main

echo ""
echo "✅ 推送完成！"
echo ""
echo "📱 下一步："
echo "1. 访问 https://github.com/ChaseQQ123/toki-app/settings/pages"
echo "2. Source: Deploy from a branch"
echo "3. Branch: main"
echo "4. Folder: /web-demo"
echo "5. 点击 Save"
echo ""
echo "🎉 完成后访问："
echo "https://chaseqq123.github.io/toki-app/"
