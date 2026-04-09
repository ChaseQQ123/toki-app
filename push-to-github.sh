#!/bin/bash

# TOKI Demo 推送到 GitHub
# 使用方式：./push-to-github.sh

set -e

echo "🚀 TOKI Demo - GitHub 部署脚本"
echo "================================"
echo ""

# 检查是否已初始化Git
if [ ! -d ".git" ]; then
    echo "❌ Git仓库未初始化"
    exit 1
fi

# GitHub信息
REPO_NAME="toki-app"
REPO_DESC="TOKI - AI Assistant App | Token-based AI Chat"

echo "📋 准备推送到的GitHub仓库："
echo "   仓库名: $REPO_NAME"
echo "   描述: $REPO_DESC"
echo ""

# 检查GitHub CLI
if command -v gh &> /dev/null; then
    echo "✅ 检测到GitHub CLI"
    echo ""

    # 创建GitHub仓库并推送
    echo "📦 创建GitHub仓库..."
    gh repo create "$REPO_NAME" \
        --public \
        --description "$REPO_DESC" \
        --source=. \
        --push \
        --allow-squash-merge

    echo ""
    echo "✅ 仓库创建成功！"
    echo ""

    # 启用GitHub Pages
    echo "🌐 启用GitHub Pages..."
    gh api -X POST repos/{owner}/{repo}/pages \
        -f source='{"branch":"master","path":"/web-demo"}' \
        2>/dev/null || echo "GitHub Pages可能需要手动启用"

    echo ""
    echo "🎉 部署完成！"
    echo ""
    echo "📱 访问地址："
    echo "   https://toknm.github.io/toki-app/"
    echo ""
    echo "⏱️  GitHub Pages可能需要1-2分钟生效"
    echo ""

else
    echo "⚠️  未检测到GitHub CLI"
    echo ""
    echo "请手动完成以下步骤："
    echo ""
    echo "1️⃣  在GitHub创建仓库："
    echo "   https://github.com/new"
    echo "   仓库名: toki-app"
    echo "   设置为: Public"
    echo ""
    echo "2️⃣  添加远程仓库并推送："
    echo "   git remote add origin https://github.com/YOUR_USERNAME/toki-app.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
    echo "3️⃣  启用GitHub Pages："
    echo "   仓库Settings → Pages → Source: main branch → /web-demo folder → Save"
    echo ""
    echo "4️⃣  访问地址："
    echo "   https://YOUR_USERNAME.github.io/toki-app/"
    echo ""
fi
