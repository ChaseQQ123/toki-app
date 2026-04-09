# TOKI 开发启动计划

## 📅 Week 1 具体任务（2026-04-09 至 2026-04-15）

### Day 1（今天，2026-04-09）

#### 任务1：项目初始化 ✅
- [x] 创建项目目录结构
- [x] Git仓库初始化
- [x] Web Demo部署
- [ ] 创建React Native项目骨架

#### 任务2：语音对话助手基础功能
- [ ] 实现Web版语音识别（Web Speech API）
- [ ] 实现Web版语音合成（Web Speech API）
- [ ] 创建基础对话界面
- [ ] 连接Gemma 4 API（先用免费API）

#### 任务3：开发环境准备
- [ ] 安装Node.js和React Native CLI
- [ ] 配置Android开发环境
- [ ] 配置iOS开发环境（Mac）
- [ ] 安装必要的依赖包

---

### Day 2（2026-04-10）

#### 任务1：Gemma 4集成
- [ ] 申请Gemma 4 API访问权限
- [ ] 编写Gemma 4调用封装
- [ ] 实现对话上下文管理
- [ ] 测试对话质量

#### 任务2：科大讯飞ASR集成
- [ ] 注册科大讯飞开发者账号
- [ ] 获取API密钥
- [ ] 集成实时语音识别
- [ ] 测试识别准确率

#### 任务3：Edge TTS集成
- [ ] 安装edge-tts Python包
- [ ] 创建TTS服务
- [ ] 测试语音合成质量
- [ ] 优化响应速度

---

### Day 3（2026-04-11）

#### 任务1：语音对话助手完整实现
- [ ] ASR + Gemma 4 + TTS 集成
- [ ] 实现多轮对话
- [ ] 添加意图识别
- [ ] 实现基础任务执行

#### 任务2：UI/UX优化
- [ ] 设计语音交互界面
- [ ] 实现动画效果
- [ ] 优化用户体验
- [ ] 测试响应速度

---

### Day 4（2026-04-12）

#### 任务1：会议秘书功能
- [ ] 实现实时音频录制
- [ ] 集成科大讯飞实时转写
- [ ] 实现说话人分离
- [ ] 生成会议纪要

#### 任务2：会议纪要生成
- [ ] 设计纪要模板
- [ ] 提取决策事项
- [ ] 提取行动项
- [ ] 自动创建提醒

---

### Day 5（2026-04-13）

#### 任务1：图像识别功能
- [ ] 集成图片上传
- [ ] 集成Gemma 4 Vision
- [ ] 实现OCR识别
- [ ] 测试识别准确率

#### 任务2：图像分析
- [ ] 物体识别
- [ ] 场景理解
- [ ] 细节分析
- [ ] 生成报告

---

### Day 6（2026-04-14）

#### 任务1：集成测试
- [ ] 测试所有核心功能
- [ ] 修复Bug
- [ ] 性能优化
- [ ] 用户体验优化

#### 任务2：文档编写
- [ ] API文档
- [ ] 用户手册
- [ ] 部署文档

---

### Day 7（2026-04-15）

#### 任务1：内测准备
- [ ] 准备内测版本
- [ ] 邀请内测用户
- [ ] 收集反馈
- [ ] 规划Week 2任务

---

## 🛠️ 开发环境配置

### 必需软件

```bash
# Node.js (v18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# React Native CLI
npm install -g react-native-cli

# Yarn
npm install -g yarn

# Python (v3.11+)
sudo apt-get install python3.11 python3-pip

# 必要的Python包
pip install edge-tts requests websockets
```

### 项目结构

```
toki-app/
├── mobile-app/           # React Native手机APP
│   ├── src/
│   │   ├── screens/     # 页面
│   │   ├── components/  # 组件
│   │   ├── services/    # 服务
│   │   └── utils/       # 工具
│   ├── App.js
│   └── package.json
│
├── backend/              # 后端服务
│   ├── api/             # API服务
│   ├── ai/              # AI服务
│   ├── asr/             # 语音识别
│   ├── tts/             # 语音合成
│   └── requirements.txt
│
├── web-demo/            # Web演示版
│   ├── index.html
│   ├── style.css
│   └── app.js
│
└── docs/                # 文档
    ├── API.md
    ├── DEPLOY.md
    └── USER_GUIDE.md
```

---

## 📋 需要Tony提供的资源清单

### 立即需要（Day 1-2）

1. **GPU服务器**
   - 配置：RTX 4060或以上，16GB+显存
   - 用途：部署Gemma 4 26B
   - 建议：阿里云/腾讯云GPU实例

2. **科大讯飞账号**
   - 注册地址：https://www.xfyun.cn/
   - 需要服务：实时语音转写
   - 费用：按量付费或包月

3. **支付宝开发者账号**
   - 注册地址：https://open.alipay.com/
   - 用途：支付系统集成

### Week 2需要

4. **微信支付商户账号**
   - 注册地址：https://pay.weixin.qq.com/
   - 用途：微信支付集成

5. **Apple Developer账号**
   - 注册地址：https://developer.apple.com/
   - 费用：$99/年
   - 用途：iOS App Store上架

6. **Google Play开发者账号**
   - 注册地址：https://play.google.com/console/
   - 费用：$25一次性
   - 用途：Android应用上架

---

## 🚀 立即开始的任务

### 1. 创建React Native项目

```bash
cd /home/tony/.openclaw/workspace/toki-app
npx react-native init TOKIApp --template typescript
```

### 2. 创建后端服务

```bash
mkdir -p backend/{api,ai,asr,tts}
touch backend/requirements.txt
touch backend/main.py
```

### 3. 实现Web版语音助手

先实现一个可用的Web版本，快速验证技术方案。

---

## 💰 预算估算（第一个月）

| 项目 | 费用 | 说明 |
|------|------|------|
| GPU服务器 | ¥800 | 阿里云/腾讯云 |
| 科大讯飞ASR | ¥500 | 测试用量 |
| 域名+SSL | ¥100 | toki.toknm.hk |
| 测试设备 | - | 使用现有手机 |
| **总计** | **¥1,400** | 第一个月 |

---

## ✅ 今天要完成的任务

1. [ ] 创建React Native项目
2. [ ] 实现Web版语音助手原型
3. [ ] 编写Gemma 4 API调用代码
4. [ ] 准备部署脚本
5. [ ] 列出详细的技术文档

---

_创建时间：2026-04-09_
_状态：开发启动_
