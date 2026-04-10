// TOKI 智能路由器 - CORS修复版

class TOKISmartRouter {
    constructor() {
        // 智谱AI配置
        this.zhipuApiKey = 'c4911cf15f844167bd26301e25622cf1.n1BU10ytXbnQ6N5d';
        this.zhipuBaseUrl = 'https://open.bigmodel.cn/api/paas/v4';
        
        // 模型配置（使用实际可用的模型名称）
        this.models = {
            text: {
                simple: 'glm-4-flash',      // 简单任务
                medium: 'glm-4-air',        // 中等任务
                complex: 'glm-4.7'          // 复杂任务
            },
            vision: 'glm-4v',               // 图像理解
            imageGen: 'cogview-3-flash',    // 图像生成
            videoGen: 'cogvideox-flash'     // 视频生成
        };
        
        // 测试连接
        this.testConnection();
    }
    
    /**
     * 测试网络连接
     */
    async testConnection() {
        console.log('🧪 测试智谱AI连接...');
        
        try {
            const response = await fetch(`${this.zhipuBaseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.zhipuApiKey}`
                },
                body: JSON.stringify({
                    model: 'glm-4-flash',
                    messages: [{role: 'user', content: '测试'}],
                    max_tokens: 5
                })
            });
            
            if (response.ok) {
                console.log('✅ 智谱AI连接成功');
            } else {
                console.error('❌ 智谱AI连接失败:', response.status);
                const error = await response.text();
                console.error('错误详情:', error);
            }
        } catch (error) {
            console.error('❌ 网络连接失败');
            console.error('错误类型:', error.name);
            console.error('错误信息:', error.message);
            
            // 详细错误提示
            if (error.name === 'TypeError') {
                console.error('💡 可能原因：CORS策略阻止（浏览器安全限制）');
                console.error('💡 解决方案：需要后端代理或使用支持的API');
            }
        }
    }
    
    /**
     * 智能分类请求类型
     */
    classifyRequest(text) {
        const lowerText = text.toLowerCase();
        
        // 图像生成关键词
        if (this.containsKeywords(lowerText, ['生成图片', '画一张', '画个', '创建图像', '生成图像', 'draw', '画图'])) {
            return 'image_gen';
        }
        
        // 视频生成关键词
        if (this.containsKeywords(lowerText, ['生成视频', '制作视频', '创建视频', '短视频'])) {
            return 'video_gen';
        }
        
        // 图像理解关键词
        if (this.containsKeywords(lowerText, ['图片中', '这张图', '看图', '识别图片', '图像识别', '图片是什么'])) {
            return 'vision';
        }
        
        // 默认文本对话
        return 'text';
    }
    
    /**
     * 评估任务复杂度
     */
    estimateComplexity(text) {
        const lowerText = text.toLowerCase();
        
        // 高复杂度
        if (this.containsKeywords(lowerText, ['分析', '推理', '创作', '设计', '算法', '代码', '复杂'])) {
            return 'high';
        }
        
        // 低复杂度
        if (this.containsKeywords(lowerText, ['翻译', '总结', '改写', '简单', '快速'])) {
            return 'low';
        }
        
        return 'medium';
    }
    
    /**
     * 检查是否包含关键词
     */
    containsKeywords(text, keywords) {
        return keywords.some(keyword => text.includes(keyword));
    }
    
    /**
     * 选择最优模型
     */
    selectModel(requestType, complexity = 'medium') {
        switch (requestType) {
            case 'text':
                if (complexity === 'high') return this.models.text.complex;
                if (complexity === 'low') return this.models.text.simple;
                return this.models.text.medium;
            
            case 'vision':
                return this.models.vision;
            
            case 'image_gen':
                return this.models.imageGen;
            
            case 'video_gen':
                return this.models.videoGen;
            
            default:
                return this.models.text.simple;
        }
    }
    
    /**
     * 文本对话（自动路由）
     */
    async chat(messages, options = {}) {
        // 分类请求
        const lastMessage = messages[messages.length - 1]?.content || '';
        const requestType = this.classifyRequest(lastMessage);
        const complexity = this.estimateComplexity(lastMessage);
        const selectedModel = this.selectModel(requestType, complexity);
        
        console.log('🔀 智能路由:', {
            requestType,
            complexity,
            selectedModel
        });
        
        // 调用智谱AI
        try {
            const response = await fetch(`${this.zhipuBaseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.zhipuApiKey}`
                },
                body: JSON.stringify({
                    model: selectedModel,  // 直接使用模型名称
                    messages: messages,
                    temperature: options.temperature || 0.7,
                    max_tokens: options.maxTokens || 2000
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API错误:', response.status, errorText);
                throw new Error(`API错误: ${response.status}`);
            }
            
            const data = await response.json();
            
            // 添加路由信息
            data.routing = {
                requestType,
                complexity,
                selectedModel
            };
            
            return data;
            
        } catch (error) {
            console.error('❌ 对话失败:', error);
            throw error;
        }
    }
    
    /**
     * 图像生成
     */
    async generateImage(prompt) {
        console.log('🎨 生成图像:', prompt);
        
        try {
            const response = await fetch(`${this.zhipuBaseUrl}/images/generations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.zhipuApiKey}`
                },
                body: JSON.stringify({
                    model: this.models.imageGen,
                    prompt: prompt
                })
            });
            
            if (!response.ok) {
                throw new Error(`图像生成失败: ${response.status}`);
            }
            
            const data = await response.json();
            data.routing = {
                requestType: 'image_gen',
                selectedModel: this.models.imageGen
            };
            
            return data;
            
        } catch (error) {
            console.error('❌ 图像生成失败:', error);
            throw error;
        }
    }
    
    /**
     * 图像理解
     */
    async analyzeImage(imageUrl, question) {
        console.log('📸 分析图像:', question);
        
        try {
            const response = await fetch(`${this.zhipuBaseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.zhipuApiKey}`
                },
                body: JSON.stringify({
                    model: this.models.vision,
                    messages: [{
                        role: 'user',
                        content: [
                            {
                                type: 'image_url',
                                image_url: { url: imageUrl }
                            },
                            {
                                type: 'text',
                                text: question
                            }
                        ]
                    }]
                })
            });
            
            if (!response.ok) {
                throw new Error(`图像理解失败: ${response.status}`);
            }
            
            const data = await response.json();
            data.routing = {
                requestType: 'vision',
                selectedModel: this.models.vision
            };
            
            return data;
            
        } catch (error) {
            console.error('❌ 图像理解失败:', error);
            throw error;
        }
    }
    
    /**
     * 获取可用模型列表
     */
    getAvailableModels() {
        return {
            text: Object.values(this.models.text),
            vision: this.models.vision,
            imageGen: this.models.imageGen,
            videoGen: this.models.videoGen
        };
    }
}

// 导出
window.TOKISmartRouter = TOKISmartRouter;
