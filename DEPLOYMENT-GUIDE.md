# TOKI APP + TOKNM API 集成部署指南

## 📊 架构说明

```
TOKI APP (前端)
    ↓ HTTP请求
TOKNM API Gateway (阿里云服务器)
    ↓ API调用
智谱AI (7个免费模型)
```

---

## 🚀 部署步骤

### 第一步：部署API网关到阿里云

#### 选项A：手动部署（推荐）

1. **SSH登录服务器**
```bash
ssh root@8.217.119.125
```

2. **创建项目目录**
```bash
mkdir -p /opt/toknm-api
cd /opt/toknm-api
```

3. **创建API网关文件**
```bash
cat > gateway.py << 'EOF'
# 复制 gateway.py 的内容
EOF
```

4. **创建依赖文件**
```bash
cat > requirements.txt << 'EOF'
fastapi==0.110.0
uvicorn[standard]==0.27.1
httpx==0.26.0
pydantic==2.6.1
EOF
```

5. **安装依赖**
```bash
pip3 install -r requirements.txt
```

6. **启动服务**
```bash
# 测试运行
python3 gateway.py

# 后台运行
nohup python3 gateway.py > toknm.log 2>&1 &

# 查看日志
tail -f toknm.log
```

7. **验证服务**
```bash
# 本地测试
curl http://localhost:8000/v1/models

# 外网测试（需要开放8000端口）
curl http://8.217.119.125:8000/v1/models
```

#### 选项B：自动部署

```bash
cd /home/tony/.openclaw/workspace/toknm-api
./deploy.sh
```

---

### 第二步：配置Nginx（可选）

如果需要使用域名 `api.toknm.hk`：

```nginx
server {
    listen 80;
    server_name api.toknm.hk;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

### 第三步：修改TOKI APP

#### 1. 添加AI服务文件

将 `ai-service.js` 复制到TOKI APP目录：

```bash
cp /home/tony/.openclaw/workspace/toki-app/ai-service.js \
   /home/tony/.openclaw/workspace/toki-app/
```

#### 2. 修改 `index.html`

在 `<head>` 中添加：

```html
<script src="ai-service.js"></script>
```

#### 3. 修改 `app.js`

在文件开头添加：

```javascript
// 引入AI服务
const aiService = new TOKIAIService();
aiService.loadTokenUsage();
```

替换 `callAI` 函数（参考 INTEGRATION-GUIDE.md）

#### 4. 修改语音助手

在 `voice-assistant/complete-voice-app.js` 中：

- 引入 ai-service.js
- 修改 `getAIResponse()` 方法

---

### 第四步：测试集成

#### 1. 测试API

```bash
# 测试模型列表
curl http://8.217.119.125:8000/v1/models

# 测试对话
curl -X POST http://8.217.119.125:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-4.7-flash",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

#### 2. 测试TOKI APP

```bash
# 本地启动
cd /home/tony/.openclaw/workspace/toki-app
python3 -m http.server 8080

# 访问
# http://localhost:8080
```

#### 3. 检查Token消耗

打开浏览器控制台，查看：
- Token使用情况
- API调用日志
- 错误信息

---

## 🔧 配置说明

### API端点配置

在 `ai-service.js` 中：

```javascript
// 生产环境（需要域名）
this.baseURL = 'https://api.toknm.hk';

// 测试环境（直接IP）
this.baseURL = 'http://8.217.119.125:8000';
```

### 模型选择

```javascript
// 默认模型
this.defaultModel = 'glm-4.7-flash'; // 最新免费模型

// 其他选项
// 'glm-4.5-flash' - 支持深度思考
// 'glm-4.6v-flash' - 视觉模型（图像理解）
```

### Token套餐

```javascript
this.tokens = {
    used: 0,
    total: 10000, // 体验版
    userId: 'demo_user'
};

// 其他套餐
// 标准版: 100,000 tokens
// 专业版: 500,000 tokens
// 尊享版: 无限tokens
```

---

## 🎯 下一步优化

### 1. 用户系统

- 用户注册/登录
- Token账户管理
- 套餐购买

### 2. 认证系统

- API Key认证
- JWT Token
- 速率限制

### 3. 数据分析

- 用户使用统计
- Token消耗分析
- 模型调用分布

### 4. 扩展模型

- 集成DeepSeek
- 集成阿里千问
- 智能路由（根据任务选择最优模型）

---

## 📱 使用流程

1. **用户打开TOKI APP**
2. **输入问题或语音对话**
3. **TOKI调用TOKNM API**
4. **TOKNM调用智谱AI**
5. **返回AI回复**
6. **扣除Token**
7. **显示结果**

---

## 🆘 故障排查

### API无法访问

```bash
# 检查服务是否运行
ssh root@8.217.119.125
ps aux | grep gateway

# 检查端口
netstat -tuln | grep 8000

# 查看日志
tail -f /opt/toknm-api/toknm.log
```

### Token余额不足

```javascript
// 重置Token（测试用）
localStorage.clear();
location.reload();
```

### CORS错误

在 `gateway.py` 中已配置允许所有来源，生产环境需要限制：

```python
allow_origins=["https://toknm.hk", "https://chaseqq123.github.io"]
```

---

## 📊 成本估算

### 智谱AI免费额度

- 7个模型免费使用
- 无调用次数限制
- 适合初期测试

### TOKNM Token定价

| 套餐 | 价格 | Tokens | 适合人群 |
|------|------|--------|---------|
| 体验版 | 免费 | 10,000/月 | 新用户体验 |
| 标准版 | ¥19.9/月 | 100,000 | 个人用户 |
| 专业版 | ¥49.9/月 | 500,000 | 重度用户 |
| 尊享版 | ¥99.9/月 | 无限 | 商务人士 |

---

## ✅ 检查清单

- [ ] API网关部署到阿里云
- [ ] API测试通过
- [ ] TOKI APP添加ai-service.js
- [ ] TOKI APP修改app.js
- [ ] 本地测试通过
- [ ] Token计费正常
- [ ] 部署到GitHub Pages
- [ ] 配置域名（可选）
- [ ] HTTPS配置（可选）

---

**部署完成后，TOKI APP就可以使用真实AI模型了！** 🎉
