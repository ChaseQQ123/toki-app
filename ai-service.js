// TOKI APP - AI服务集成（智谱AI版）

class TOKIAIService {
    constructor() {
        // API配置
        this.baseURL = 'https://api.toknm.hk'; // 生产环境
        // this.baseURL = 'http://8.217.119.125:8000'; // 测试环境
        
        // 默认模型
        this.defaultModel = 'glm-4.7-flash';
        
        // Token管理
        this.tokens = {
            used: 0,
            total: 10000, // 体验版
            userId: 'demo_user'
        };
    }
    
    /**
     * 发送消息并获取AI回复
     * @param {string} message - 用户消息
     * @param {object} options - 选项
     * @returns {Promise<object>} - AI回复
     */
    async sendMessage(message, options = {}) {
        const {
            model = this.defaultModel,
            conversationHistory = [],
            stream = false
        } = options;
        
        // 构建消息历史
        const messages = [
            ...conversationHistory,
            { role: 'user', content: message }
        ];
        
        // 检查Token余额
        if (this.tokens.used >= this.tokens.total) {
            throw new Error('Token余额不足，请充值或升级套餐');
        }
        
        try {
            const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${this.apiKey}` // 如果需要认证
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 2000,
                    stream: stream
                })
            });
            
            if (!response.ok) {
                throw new Error(`API错误: ${response.status}`);
            }
            
            const data = await response.json();
            
            // 更新Token使用量
            if (data.usage) {
                this.tokens.used += data.usage.total_tokens;
                this.saveTokenUsage();
            }
            
            return {
                text: data.choices[0].message.content,
                model: data.model,
                tokens: data.usage,
                fullResponse: data
            };
            
        } catch (error) {
            console.error('❌ AI调用失败:', error);
            throw error;
        }
    }
    
    /**
     * 流式消息（实时输出）
     */
    async sendMessageStream(message, onChunk) {
        const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                model: this.defaultModel,
                messages: [{role: 'user', content: message}],
                stream: true
            })
        });
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') return;
                    
                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices[0]?.delta?.content;
                        if (content) {
                            onChunk(content);
                        }
                    } catch (e) {
                        // 忽略解析错误
                    }
                }
            }
        }
    }
    
    /**
     * 获取可用模型列表
     */
    async getModels() {
        const response = await fetch(`${this.baseURL}/v1/models`);
        const data = await response.json();
        return data.data;
    }
    
    /**
     * 获取Token余额
     */
    getTokenBalance() {
        return {
            used: this.tokens.used,
            total: this.tokens.total,
            remaining: this.tokens.total - this.tokens.used,
            percentage: (this.tokens.used / this.tokens.total * 100).toFixed(1)
        };
    }
    
    /**
     * 保存Token使用记录
     */
    saveTokenUsage() {
        localStorage.setItem('toki_tokens', JSON.stringify(this.tokens));
    }
    
    /**
     * 加载Token使用记录
     */
    loadTokenUsage() {
        const saved = localStorage.getItem('toki_tokens');
        if (saved) {
            this.tokens = JSON.parse(saved);
        }
    }
}

// 导出服务
window.TOKIAIService = TOKIAIService;
