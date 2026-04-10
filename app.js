// TOKI APP - 主逻辑

// 状态管理
const state = {
    tokens: 8542,
    maxTokens: 10000,
    messages: [],
    isTyping: false
};

// DOM 元素
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const tokenCount = document.getElementById('tokenCount');
const clearBtn = document.getElementById('clearBtn');
const upgradeBtn = document.getElementById('upgradeBtn');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    setupEventListeners();
    updateTokenDisplay();
});

// 事件监听
function setupEventListeners() {
    // 发送消息
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 清空对话
    clearBtn.addEventListener('click', clearChat);

    // 套餐弹窗
    upgradeBtn.addEventListener('click', () => showModal());
    closeModal.addEventListener('click', () => hideModal());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });

    // 套餐按钮
    document.querySelectorAll('.plan-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => selectPlan(index));
    });
}

// 发送消息
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message || state.isTyping) return;

    // 检查Token余额
    if (state.tokens <= 0) {
        showModal();
        return;
    }

    // 显示用户消息
    addMessage(message, 'user');
    userInput.value = '';

    // 显示输入动画
    showTypingIndicator();

    try {
        // 调用AI API
        const response = await callAI(message);
        
        // 移除输入动画
        hideTypingIndicator();
        
        // 显示AI回复
        addMessage(response.text, 'bot');
        
        // 扣除Token
        const tokensUsed = response.tokens || Math.ceil(message.length + response.text.length);
        state.tokens -= tokensUsed;
        updateTokenDisplay();
        saveState();

    } catch (error) {
        hideTypingIndicator();
        addMessage('抱歉，出现了错误。请稍后再试。', 'bot');
        console.error('API Error:', error);
    }
}

// 添加消息到界面
function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    
    if (type === 'user') {
        messageDiv.className = 'user-message-wrapper';
        messageDiv.innerHTML = `<div class="message user">${escapeHtml(text)}</div>`;
    } else {
        messageDiv.className = 'welcome-message';
        messageDiv.innerHTML = `
            <div class="bot-avatar">🤖</div>
            <div class="message bot">${escapeHtml(text)}</div>
        `;
    }

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // 保存消息
    state.messages.push({ text, type, timestamp: Date.now() });
    saveState();
}

// 显示输入动画
function showTypingIndicator() {
    state.isTyping = true;
    const indicator = document.createElement('div');
    indicator.className = 'welcome-message';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = `
        <div class="bot-avatar">🤖</div>
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    chatContainer.appendChild(indicator);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 隐藏输入动画
function hideTypingIndicator() {
    state.isTyping = false;
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

// 调用智谱AI API (真实)
async function callAI(message) {
    // 智谱AI配置
    const ZHIPU_API_KEY = 'c4911cf15f844167bd26301e25622cf1.n1BU10ytXbnQ6N5d';
    const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    
    try {
        const response = await fetch(ZHIPU_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ZHIPU_API_KEY}`
            },
            body: JSON.stringify({
                model: 'glm-4-flash', // 免费模型
                messages: [{ role: 'user', content: message }],
                temperature: 0.7,
                max_tokens: 1000
            })
        });
        
        if (!response.ok) {
            throw new Error(`API错误: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 提取回复
        const text = data.choices[0].message.content;
        const tokens = data.usage?.total_tokens || Math.ceil(message.length * 0.5);
        
        return { text, tokens };
        
    } catch (error) {
        console.error('API调用失败:', error);
        
        // 降级到本地回复
        const fallbackResponses = {
            '你好': '你好！我是TOKI，很高兴为你服务！',
            '你是谁': '我是TOKI，你的AI助手。',
            '功能': '我可以帮你回答问题、提供建议、协助写作等。',
        };
        
        const fallback = fallbackResponses[message.toLowerCase()] || 
            `网络连接失败，请检查网络后重试。`;
        
        return { text: fallback, tokens: 10 };
    }
}

// 更新Token显示
function updateTokenDisplay() {
    tokenCount.textContent = state.tokens.toLocaleString();
    
    // 颜色提示
    if (state.tokens < 1000) {
        tokenCount.style.color = '#ff4444';
    } else if (state.tokens < 3000) {
        tokenCount.style.color = '#ff8800';
    } else {
        tokenCount.style.color = 'white';
    }
}

// 清空对话
function clearChat() {
    if (confirm('确定要清空所有对话记录吗？')) {
        // 保留欢迎消息
        chatContainer.innerHTML = `
            <div class="welcome-message">
                <div class="bot-avatar">🤖</div>
                <div class="message bot">
                    对话已清空。有什么我可以帮你的吗？
                </div>
            </div>
        `;
        state.messages = [];
        saveState();
    }
}

// 显示套餐弹窗
function showModal() {
    modal.classList.add('active');
}

// 隐藏套餐弹窗
function hideModal() {
    modal.classList.remove('active');
}

// 选择套餐
function selectPlan(index) {
    const plans = [
        { name: '体验版', tokens: 10000, price: 0 },
        { name: '标准版', tokens: 500000, price: 49.9 },
        { name: '尊享版', tokens: Infinity, price: 99.9 }
    ];
    
    const plan = plans[index];
    
    if (plan.price === 0) {
        alert('你已在使用体验版套餐');
        return;
    }
    
    // TODO: 集成支付系统
    // 内地：支付宝/微信支付
    // 海外：Stripe
    alert(`即将支付 ¥${plan.price}/月\n\n支付功能正在开发中，敬请期待！`);
    hideModal();
}

// 保存状态到本地存储
function saveState() {
    localStorage.setItem('toki_state', JSON.stringify({
        tokens: state.tokens,
        messages: state.messages.slice(-50) // 只保留最近50条
    }));
}

// 从本地存储加载状态
function loadState() {
    const saved = localStorage.getItem('toki_state');
    if (saved) {
        const data = JSON.parse(saved);
        state.tokens = data.tokens || 8542;
        state.messages = data.messages || [];
        
        // 恢复历史消息
        state.messages.forEach(msg => {
            if (msg.type === 'user') {
                const wrapper = document.createElement('div');
                wrapper.className = 'user-message-wrapper';
                wrapper.innerHTML = `<div class="message user">${escapeHtml(msg.text)}</div>`;
                chatContainer.appendChild(wrapper);
            } else {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'welcome-message';
                messageDiv.innerHTML = `
                    <div class="bot-avatar">🤖</div>
                    <div class="message bot">${escapeHtml(msg.text)}</div>
                `;
                chatContainer.appendChild(messageDiv);
            }
        });
        
        // 滚动到底部
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}

// 测试命令（浏览器控制台使用）
window.TOKI = {
    reset: () => {
        localStorage.clear();
        location.reload();
    },
    addTokens: (amount) => {
        state.tokens += amount;
        updateTokenDisplay();
        saveState();
        console.log(`已添加 ${amount} tokens`);
    }
};
