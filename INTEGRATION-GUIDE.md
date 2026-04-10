// TOKI APP - 集成智谱AI API

// ===== 修改 app.js =====

// 1. 引入AI服务
const aiService = new TOKIAIService();
aiService.loadTokenUsage();

// 2. 替换 callAI 函数
async function callAI(message) {
    try {
        // 调用真实API
        const response = await aiService.sendMessage(message, {
            model: 'glm-4.7-flash',
            conversationHistory: state.messages.slice(-10) // 最近10条消息
        });
        
        return {
            text: response.text,
            tokens: response.tokens?.total_tokens || Math.ceil(message.length * 0.5)
        };
        
    } catch (error) {
        console.error('API调用失败:', error);
        
        // 降级到本地模拟（如果API不可用）
        if (error.message.includes('Failed to fetch')) {
            return {
                text: '抱歉，网络连接失败。请检查网络设置。',
                tokens: 10
            };
        }
        
        throw error;
    }
}

// 3. 更新Token显示
function updateTokenDisplay() {
    const balance = aiService.getTokenBalance();
    tokenCount.textContent = (balance.total - balance.used).toLocaleString();
    
    // 颜色提示
    if (balance.remaining < 1000) {
        tokenCount.style.color = '#ff4444';
    } else if (balance.remaining < 3000) {
        tokenCount.style.color = '#ff8800';
    } else {
        tokenCount.style.color = 'white';
    }
    
    // 显示百分比
    console.log(`Token使用: ${balance.percentage}%`);
}

// ===== 修改 voice-assistant/complete-voice-app.js =====

// 在 TOKIVoiceAssistant 类中添加：

async getAIResponse(text) {
    try {
        // 使用AI服务
        const response = await aiService.sendMessage(text);
        return response.text;
        
    } catch (error) {
        console.error('获取AI回复失败:', error);
        
        // 降级到本地回复
        return this.getLocalResponse(text);
    }
}

// 本地降级回复
getLocalResponse(text) {
    const responses = {
        '你好': '你好！我是TOKI，很高兴为你服务！',
        '早上好': '早上好！今天天气真不错，祝你愉快！',
        '你是谁': '我是TOKI，你的AI语音助手。',
    };
    
    return responses[text] || `我听到你说："${text}"。这是一个很好的问题！`;
}
