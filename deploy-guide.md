# TOKI Demo 部署指南

## 方式1：SSH部署（推荐）

### 需要的信息
- SSH用户名：root（或其他用户）
- SSH密码 或 私钥文件

### 执行步骤
```bash
# 1. 进入项目目录
cd /home/tony/.openclaw/workspace/toki-app

# 2. 执行部署脚本
./deploy-toknm.sh
```

### 如果没有SSH密码
请在消息中提供：
- SSH用户名
- SSH密码
或
- SSH私钥文件路径

---

## 方式2：手动上传（备选）

### 使用 scp 上传
```bash
# 打包文件
cd /home/tony/.openclaw/workspace/toki-app/web-demo
tar -czf toki-demo.tar.gz .

# 上传到服务器
scp toki-demo.tar.gz root@8.217.119.125:/tmp/

# SSH 登录并解压
ssh root@8.217.119.125
mkdir -p /var/www/toknm.hk/toki
tar -xzf /tmp/toki-demo.tar.gz -C /var/www/toknm.hk/toki
chmod -R 755 /var/www/toknm.hk/toki
```

---

## 方式3：阿里云OSS（如已配置）

### 使用阿里云CLI
```bash
# 安装阿里云CLI
wget https://aliyuncli.alicdn.com/aliyun-cli-linux-latest-amd64.tgz
tar -xzf aliyun-cli-linux-latest-amd64.tgz
sudo mv aliyun /usr/local/bin/

# 配置Access Key
aliyun configure

# 上传到OSS
aliyun oss cp -r /home/tony/.openclaw/workspace/toki-app/web-demo oss://toknm-hk/toki/
```

---

## 方式4：使用现有mail服务器

如果服务器上已经有Nginx/Apache运行：

```bash
# 检查Web服务器
ssh root@8.217.119.125 "nginx -v"

# 创建虚拟主机
# 添加到 Nginx 配置：
# location /toki/ {
#     alias /var/www/toknm.hk/toki/;
# }
```

---

## 部署后的访问地址

- **https://toknm.hk/toki/**
- **https://toki.toknm.hk/** (需配置DNS)

---

## 需要帮助？

如果部署遇到问题，请提供：
1. SSH访问信息（用户名/密码或私钥）
2. 或选择其他部署方式（Vercel/GitHub Pages）

我会立即帮你完成部署！
