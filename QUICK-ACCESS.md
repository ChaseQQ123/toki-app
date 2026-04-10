# 快速解决方案：直接在本地启动服务供手机访问

## 方案1：使用局域网IP（最简单）

电脑和手机连接同一WiFi，然后：

1. 获取电脑局域网IP：
```bash
hostname -I | awk '{print $1}'
```

2. 启动服务：
```bash
cd /home/tony/.openclaw/workspace/toki-app
python3 -m http.server 8080 --bind 0.0.0.0
```

3. 手机浏览器访问：
```
http://YOUR_LOCAL_IP:8080
```

## 方案2：使用ngrok（推荐）

1. 安装ngrok：
```bash
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar -xzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/
```

2. 启动服务：
```bash
cd /home/tony/.openclaw/workspace/toki-app
python3 -m http.server 8080 &
```

3. 启动ngrok：
```bash
ngrok http 8080
```

4. 使用ngrok提供的公网地址访问

## 方案3：配置GitHub Pages

访问：https://github.com/ChaseQQ123/toki-app/settings/pages

1. 选择 Source：Deploy from a branch
2. 选择 Branch：main
3. 选择 Folder：/(root)
4. 点击 Save

等待1-2分钟后访问：
https://chaseqq123.github.io/toki-app/
