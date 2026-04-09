# TOKI - AI助手 APP

> One Token, All AI Models

## 项目简介

TOKI是一款面向大众的AI助手应用，用户通过购买Token套餐使用AI服务。

**商业模式**：手机运营商模式
- TOKNM提供AI能力（基站）
- TOKI APP作为用户终端（手机）
- Token套餐作为计费方式（流量）

## Demo体验

### Web版Demo

```bash
cd /home/tony/.openclaw/workspace/toki-app/web-demo

# 方式1：直接用浏览器打开
# 打开 index.html 文件

# 方式2：使用Python启动本地服务器
python3 -m http.server 8080
# 然后访问 http://localhost:8080
```

### 功能特性

✅ **已实现**：
- 基础对话界面
- Token余额显示
- Token消耗计数
- 套餐弹窗展示
- 对话历史保存
- 响应式设计（手机/PC）
- 清空对话功能

🚧 **待实现**：
- 真实AI API集成（TOKNM）
- 支付系统（支付宝/微信/Stripe）
- 用户注册/登录
- 套餐购买流程
- 更多AI功能

## 项目结构

```
toki-app/
├── web-demo/           # Web版Demo
│   ├── index.html      # 主页面
│   ├── style.css       # 样式文件
│   └── app.js          # 逻辑代码
├── mobile-app/         # 手机APP（待开发）
│   ├── ios/           # iOS版本
│   └── android/       # Android版本
├── backend/           # 后端服务（待开发）
│   ├── auth/         # 用户认证
│   ├── token/        # Token管理
│   └── payment/      # 支付系统
└── README.md
```

## 套餐方案

| 套餐 | 月费 | Token额度 | 适用人群 |
|------|------|----------|----------|
| 体验版 | 免费 | 10,000 tokens/月 | 轻度用户 |
| 标准版 | ¥49.9 | 500,000 tokens/月 | 普通用户 |
| 尊享版 | ¥99.9 | 无限 tokens | 重度用户 |

## 技术栈

### Web Demo
- HTML5 + CSS3 + JavaScript
- 响应式设计
- 本地存储（LocalStorage）

### 手机APP（计划）
- React Native / Flutter
- 跨平台开发

### 后端服务（计划）
- Node.js / Python
- 数据库：PostgreSQL / MongoDB
- 缓存：Redis

### 支付系统
- 内地：支付宝 / 微信支付
- 海外：Stripe

## API集成

### TOKNM API调用示例

```javascript
async function callTOKNMAPI(message) {
    const response = await fetch('https://api.toknm.hk/v1/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_API_KEY'
        },
        body: JSON.stringify({
            model: 'deepseek-chat',  // 或其他模型
            messages: [
                { role: 'user', content: message }
            ]
        })
    });
    
    const data = await response.json();
    return {
        text: data.choices[0].message.content,
        tokens: data.usage.total_tokens
    };
}
```

## 开发计划

### 阶段1：原型验证（当前）✅
- [x] Web Demo开发
- [ ] 体验测试
- [ ] 反馈收集

### 阶段2：核心功能（2周）
- [ ] 用户注册/登录
- [ ] TOKNM API集成
- [ ] Token计费系统
- [ ] 基础UI优化

### 阶段3：支付集成（1周）
- [ ] 支付宝集成
- [ ] 微信支付集成
- [ ] Stripe集成
- [ ] 套餐购买流程

### 阶段4：手机APP（1个月）
- [ ] React Native开发
- [ ] iOS上架
- [ ] Android上架
- [ ] 推广运营

## 测试账号

### 浏览器控制台命令

```javascript
// 重置状态
TOKI.reset()

// 添加Token（测试用）
TOKI.addTokens(10000)
```

## 联系方式

- **品牌**: TOKNM
- **官网**: https://toknm.hk
- **邮箱**: support@toknm.hk

---

**Created by Yuanzi 🤖**
