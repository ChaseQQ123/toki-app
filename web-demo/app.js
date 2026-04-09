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

// 调用AI API (模拟)
async function callAI(message) {
    // TODO: 替换为真实的TOKNM API
    // const response = await fetch('https://api.toknm.hk/v1/chat', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': 'Bearer YOUR_API_KEY'
    //     },
    //     body: JSON.stringify({
    //         model: 'deepseek-chat',
    //         messages: [{ role: 'user', content: message }]
    //     })
    // });
    
    // 模拟响应（用于demo）
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // 模拟智能回复
    const responses = {
        '你好': '你好！我是TOKI，很高兴为你服务！有什么我可以帮助你的吗？',
        '介绍': '我是TOKI，你的AI助手。我可以帮你回答问题、提供建议、处理日常事务。我背后连接了多个先进的大语言模型，为你提供最优质的服务。',
        '价格': '我们的套餐非常实惠：\n• 体验版：免费，10,000 tokens/月\n• 标准版：¥49.9/月，500,000 tokens\n• 尊享版：¥99.9/月，无限tokens\n点击"升级套餐"查看详情！',
        'token': `你目前还有 ${state.tokens.toLocaleString()} tokens。Tokens是你使用AI的额度，每次对话会消耗相应数量的tokens。当额度不足时，可以购买套餐继续使用。`,
        '功能': '我可以帮你：\n✨ 回答各种问题\n📝 协助写作和编辑\n💡 提供建议和创意\n📊 数据分析和解释\n🌐 翻译和多语言支持\n还有更多功能等你探索！'
    };
    
    // 智能匹配
    const lowerMsg = message.toLowerCase();
    for (const [key, value] of Object.entries(responses)) {
        if (lowerMsg.includes(key)) {
            return { text: value, tokens: Math.ceil(message.length * 0.5) };
        }
    }
    
    // 默认回复
    const defaultResponses = [
        `这是一个很好的问题！让我想想...\n\n关于"${message}"，我需要了解更多背景信息才能给出更准确的回答。你能提供更多细节吗？`,
        `我理解你的问题。${message}是一个值得深入探讨的话题。\n\n根据我的分析，这个问题涉及多个方面。如果你想要更具体的建议，可以告诉我更多相关信息。`,
        `感谢你的提问！关于${message}，我可以从几个角度来分析：\n\n1. 首先，我们需要明确核心问题\n2. 其次，考虑相关因素\n3. 最后，制定可行的方案\n\n你觉得这个思路如何？需要我详细解释某一点吗？`
    ];
    
    const randomResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    return { text: randomResponse, tokens: Math.ceil((message.length + randomResponse.length) * 0.3) };
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
