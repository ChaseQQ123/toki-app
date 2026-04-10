# 🎉 TOKI APP 已接入智谱AI！

## 🚀 立即试用

### 方式1：本地访问（推荐）

TOKI APP 已经在本地启动！

**访问地址：**
- 主页：http://localhost:8080
- 语音助手：http://localhost:8080/voice-assistant/

### 方式2：推送到GitHub

如果你想在外网访问，我可以帮你推送到GitHub Pages：

```bash
cd /home/tony/.openclaw/workspace/toki-app
git add .
git commit -m "接入智谱AI"
git push
```

然后访问：https://chaseqq123.github.io/toki-app/

---

## ✅ 已完成的功能

### 1. 文字对话
- ✅ 接入智谱AI GLM-4-Flash模型
- ✅ Token计费系统
- ✅ 对话历史保存
- ✅ 降级处理（网络失败时）

### 2. 语音助手
- ✅ 语音识别（浏览器原生）
- ✅ 语音合成（浏览器原生）
- ✅ 智谱AI回复
- ✅ 视频通话功能

---

## 🎯 使用说明

### 文字对话

1. 打开 http://localhost:8080
2. 输入框输入问题
3. 点击"发送"
4. 等待AI回复（智谱AI）

### 语音对话

1. 打开 http://localhost:8080/voice-assistant/
2. 点击麦克风按钮 🎤
3. 说话（例如："你好"）
4. TOKI会语音回答

---

## 🤖 可用的AI能力

智谱AI GLM-4-Flash 提供：

- ✅ 中文对话
- ✅ 知识问答
- ✅ 文本生成
- ✅ 代码编写
- ✅ 翻译
- ✅ 数学推理

**完全免费！无调用次数限制！**

---

## 💡 试试这些问题

### 文字对话测试

```
你好，请介绍一下自己
写一首关于春天的诗
用Python写一个冒泡排序算法
翻译：Hello, how are you?
帮我分析一下人工智能的发展趋势
```

### 语音对话测试

```
"你好"
"现在几点了"
"今天星期几"
"讲个笑话"
"我想听一首诗"
```

---

## 📊 Token消耗

每次对话会消耗Token：
- 输入token + 输出token
- 当前余额：10,000 tokens
- 可在右上角查看剩余Token

---

## 🔧 技术细节

### API配置

```javascript
API端点: https://open.bigmodel.cn/api/paas/v4/chat/completions
模型: glm-4-flash
API Key: c4911cf15f844167bd26301e25622cf1.n1BU10ytXbnQ6N5d
```

### 成本

- **智谱AI：免费** ✅
- **TOKNM Token计费：演示** ✅
- **部署成本：¥0** ✅

---

## 🎉 开始体验吧！

打开浏览器，访问：
- http://localhost:8080

有任何问题随时告诉我！
