# GitHub部署指南

## 🚀 快速部署（3分钟）

### 方式1：使用GitHub CLI（推荐）

如果你已安装 `gh` CLI并登录：

```bash
cd /home/tony/.openclaw/workspace/toki-app
./push-to-github.sh
```

### 方式2：手动推送（3步完成）

#### 步骤1：创建GitHub仓库

1. 访问 https://github.com/new
2. 仓库名：`toki-app`
3. 描述：`TOKI - AI Assistant App`
4. 选择：Public
5. 点击：Create repository

#### 步骤2：推送代码

```bash
cd /home/tony/.openclaw/workspace/toki-app

# 添加远程仓库（替换YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/toki-app.git

# 重命名分支
git branch -M main

# 推送
git push -u origin main
```

#### 步骤3：启用GitHub Pages

1. 进入仓库 Settings → Pages
2. Source选择：Deploy from a branch
3. Branch选择：main
4. Folder选择：/web-demo
5. 点击：Save

---

## 📱 访问地址

部署完成后访问：

```
https://YOUR_USERNAME.github.io/toki-app/
```

或（如果你有自定义域名）：

```
https://toki.toknm.hk/
```

---

## 🔗 自定义域名绑定（可选）

### 如果要将toki.toknm.hk绑定到GitHub Pages：

1. 在GitHub仓库Settings → Pages → Custom domain
2. 输入：`toki.toknm.hk`
3. 在DNS添加CNAME记录：
   ```
   toki.toknm.hk → YOUR_USERNAME.github.io
   ```

---

## 📦 当前状态

✅ **已准备**：
- Git仓库初始化
- 所有文件已提交
- 推送脚本已就绪

🚧 **待完成**：
- 推送到GitHub
- 启用GitHub Pages
- （可选）绑定自定义域名

---

## 💡 快速命令

```bash
# 一键推送（需要GitHub CLI）
cd /home/tony/.openclaw/workspace/toki-app && ./push-to-github.sh

# 或手动推送
cd /home/tony/.openclaw/workspace/toki-app
git remote add origin https://github.com/YOUR_USERNAME/toki-app.git
git push -u origin main
```

---

## 📧 需要GitHub账号信息

如果你希望我自动完成部署，请提供：

- GitHub用户名
- 或GitHub Personal Access Token

或者你可以自己执行上述命令，3分钟内即可完成！

---

**当前项目位置**：`/home/tony/.openclaw/workspace/toki-app`
