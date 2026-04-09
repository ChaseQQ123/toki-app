#!/bin/bash

# TOKI Demo 部署到 toknm.hk
# 使用方式：./deploy-toknm.sh

set -e

# 服务器信息
SERVER_IP="8.217.119.125"
SERVER_USER="root"
REMOTE_PATH="/var/www/toknm.hk/toki"

# 本地文件
LOCAL_PATH="/home/tony/.openclaw/workspace/toki-app/web-demo"

echo "🚀 TOKI Demo 部署脚本"
echo "====================="
echo ""

# 检查本地文件
if [ ! -d "$LOCAL_PATH" ]; then
    echo "❌ 本地文件不存在: $LOCAL_PATH"
    exit 1
fi

echo "📁 本地文件检查通过"
echo "📦 准备上传文件..."
echo ""

# 创建临时压缩包
TEMP_FILE="/tmp/toki-demo.tar.gz"
tar -czf "$TEMP_FILE" -C "$LOCAL_PATH" .

echo "✅ 文件打包完成"
echo ""

# 上传到服务器
echo "📤 上传到服务器..."
echo "   服务器: $SERVER_IP"
echo "   目标路径: $REMOTE_PATH"
echo ""

# 使用 scp 上传
scp "$TEMP_FILE" "$SERVER_USER@$SERVER_IP:/tmp/toki-demo.tar.gz"

echo ""
echo "🔧 解压并配置..."

# SSH 到服务器执行部署
ssh "$SERVER_USER@$SERVER_IP" << 'ENDSSH'
# 创建目录
mkdir -p /var/www/toknm.hk/toki

# 解压文件
tar -xzf /tmp/toki-demo.tar.gz -C /var/www/toknm.hk/toki

# 设置权限
chmod -R 755 /var/www/toknm.hk/toki

# 清理临时文件
rm /tmp/toki-demo.tar.gz

echo "✅ 部署完成！"
ENDSSH

# 清理本地临时文件
rm "$TEMP_FILE"

echo ""
echo "🎉 部署成功！"
echo ""
echo "📱 访问地址："
echo "   https://toknm.hk/toki/"
echo "   或"
echo "   https://toki.toknm.hk/ (如已配置DNS)"
echo ""
