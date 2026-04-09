# TOKI Demo 快速启动指南

## 方式1：命令行启动（推荐）

```bash
cd /home/tony/.openclaw/workspace/toki-app
./start-demo.sh
```

然后在浏览器打开显示的地址（默认 http://localhost:8080）

## 方式2：直接打开文件

```bash
# 使用默认浏览器打开
xdg-open /home/tony/.openclaw/workspace/toki-app/web-demo/index.html
```

## 方式3：Python手动启动

```bash
cd /home/tony/.openclaw/workspace/toki-app/web-demo
python3 -m http.server 8080
# 然后访问 http://localhost:8080
```

## 测试功能

### 基础对话
- 输入任意问题，AI会回复
- 试试输入："你好"、"介绍"、"价格"、"功能"

### Token系统
- 每次对话会消耗tokens
- Token余额实时显示在右上角
- 余额不足时会弹出套餐购买提示

### 其他功能
- 点击"升级套餐"查看套餐方案
- 点击"清空对话"清除历史
- 对话历史会自动保存到浏览器

## 浏览器控制台测试

打开浏览器开发者工具（F12），在Console中输入：

```javascript
// 添加测试Token
TOKI.addTokens(50000)

// 重置所有状态
TOKI.reset()
```

## 下一步

1. ✅ 体验Web Demo
2. 📝 收集反馈
3. 🔗 集成真实TOKNM API
4. 💳 接入支付系统
5. 📱 开发手机APP
