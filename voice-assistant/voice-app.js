// TOKI 语音助手 - 核心代码
// 使用Web Speech API（完全免费）

class VoiceAssistant {
    constructor() {
        // 状态
        this.isListening = false;
        this.isSpeaking = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        
        // 配置
        this.config = {
            wakeWord: '嘿TOKI',
            wakeWordEnabled: true,
            speechRate: 1,
            offlineMode: false
        };
        
        // 对话历史
        this.conversationHistory = [];
        
        // 初始化
        this.init();
    }
    
    // 初始化
    init() {
        this.initSpeechRecognition();
        this.initUI();
        this.loadConfig();
        this.loadConversationHistory();
    }
    
    // 初始化语音识别
    initSpeechRecognition() {
        // 检查浏览器支持
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showError('您的浏览器不支持语音识别，请使用Chrome浏览器');
            return;
        }
        
        // 创建识别对象
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // 配置
        this.recognition.continuous = true;  // 持续识别
        this.recognition.interimResults = true;  // 实时结果
        this.recognition.lang = 'zh-CN';  // 中文
        this.recognition.maxAlternatives = 1;
        
        // 事件监听
        this.recognition.onstart = () => this.onRecognitionStart();
        this.recognition.onresult = (event) => this.onRecognitionResult(event);
        this.recognition.onerror = (event) => this.onRecognitionError(event);
        this.recognition.onend = () => this.onRecognitionEnd();
    }
    
    // 初始化UI
    initUI() {
        // 获取DOM元素
        this.voiceButton = document.getElementById('voiceButton');
        this.conversation = document.getElementById('conversation');
        this.transcript = document.getElementById('transcript');
        this.statusText = document.querySelector('.status-text');
        this.hint = document.getElementById('hint');
        
        // 设置按钮
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.closeSettings = document.getElementById('closeSettings');
        
        // 绑定事件
        this.voiceButton.addEventListener('click', () => this.toggleListening());
        
        this.settingsBtn.addEventListener('click', () => {
            this.settingsPanel.classList.add('active');
        });
        
        this.closeSettings.addEventListener('click', () => {
            this.settingsPanel.classList.remove('active');
        });
        
        // 设置变更
        document.getElementById('wakeWordEnabled').addEventListener('change', (e) => {
            this.config.wakeWordEnabled = e.target.checked;
            this.saveConfig();
        });
        
        document.getElementById('speechRate').addEventListener('input', (e) => {
            this.config.speechRate = parseFloat(e.target.value);
            this.saveConfig();
        });
        
        document.getElementById('offlineMode').addEventListener('change', (e) => {
            this.config.offlineMode = e.target.checked;
            this.saveConfig();
        });
    }
    
    // 切换监听状态
    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }
    
    // 开始监听
    startListening() {
        if (!this.recognition) {
            this.showError('语音识别未初始化');
            return;
        }
        
        try {
            this.recognition.start();
            this.isListening = true;
            this.updateUI('listening');
        } catch (error) {
            console.error('启动语音识别失败:', error);
            this.showError('启动语音识别失败，请重试');
        }
    }
    
    // 停止监听
    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
        }
        this.isListening = false;
        this.updateUI('idle');
    }
    
    // 识别开始
    onRecognitionStart() {
        console.log('语音识别已启动');
        this.updateStatus('正在聆听...');
    }
    
    // 识别结果
    onRecognitionResult(event) {
        let interimTranscript = '';
        let finalTranscript = '';
        
        // 遍历结果
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        
        // 显示实时识别结果
        if (interimTranscript) {
            this.updateTranscript(interimTranscript, 'listening');
        }
        
        // 处理最终结果
        if (finalTranscript) {
            this.updateTranscript(finalTranscript, 'final');
            this.processUserInput(finalTranscript);
        }
    }
    
    // 识别错误
    onRecognitionError(event) {
        console.error('语音识别错误:', event.error);
        
        let errorMessage = '语音识别出错';
        
        switch (event.error) {
            case 'no-speech':
                errorMessage = '未检测到语音，请重试';
                break;
            case 'audio-capture':
                errorMessage = '未找到麦克风，请检查设备';
                break;
            case 'not-allowed':
                errorMessage = '麦克风权限被拒绝，请在浏览器设置中允许';
                break;
            case 'network':
                errorMessage = '网络错误，请检查网络连接';
                break;
        }
        
        this.showError(errorMessage);
        this.stopListening();
    }
    
    // 识别结束
    onRecognitionEnd() {
        console.log('语音识别已停止');
        
        if (this.isListening && !this.isSpeaking) {
            // 自动重启
            setTimeout(() => {
                if (this.isListening) {
                    this.recognition.start();
                }
            }, 100);
        }
    }
    
    // 处理用户输入
    async processUserInput(text) {
        console.log('用户输入:', text);
        
        // 停止监听
        this.stopListening();
        
        // 添加用户消息
        this.addMessage(text, 'user');
        
        // 检查唤醒词
        if (this.config.wakeWordEnabled && !text.toLowerCase().includes(this.config.wakeWord.toLowerCase())) {
            // 如果启用唤醒词，但用户没有说唤醒词，则忽略
            // this.startListening();
            // return;
        }
        
        // 显示思考状态
        this.updateStatus('思考中...');
        
        try {
            // 获取AI回复
            const response = await this.getAIResponse(text);
            
            // 添加AI消息
            this.addMessage(response, 'bot');
            
            // 语音合成
            await this.speak(response);
            
        } catch (error) {
            console.error('获取回复失败:', error);
            this.showError('抱歉，我遇到了问题，请重试');
        }
        
        // 恢复监听
        this.updateStatus('准备就绪');
    }
    
    // 获取AI回复
    async getAIResponse(text) {
        // TODO: 连接Gemma 4 API
        // 目前使用本地模拟回复
        
        const responses = {
            '你好': '你好！我是TOKI，很高兴为你服务！有什么我可以帮你的吗？',
            '早上好': '早上好！今天天气真不错，祝你今天愉快！',
            '介绍一下自己': '我是TOKI，你的AI语音助手。我可以帮你处理各种任务，比如设置提醒、查询信息、安排日程等。有什么需要我帮忙的吗？',
            '现在几点': `现在是${new Date().toLocaleTimeString('zh-CN')}`,
            '今天天气': '今天天气晴朗，温度适宜，非常适合外出活动。',
            '谢谢': '不客气！这是我应该做的。还有其他需要帮忙的吗？',
            '再见': '再见！有需要随时找我，我会一直在这里。'
        };
        
        // 智能匹配
        const lowerText = text.toLowerCase();
        
        for (const [key, value] of Object.entries(responses)) {
            if (lowerText.includes(key)) {
                return value;
            }
        }
        
        // 默认回复
        const defaultResponses = [
            `我听到了你说："${text}"。这是一个很好的问题！让我想想...`,
            `关于"${text}"，我需要更多信息才能给你准确的回答。你能详细说说吗？`,
            `好的，我明白了。你说的是"${text}"对吗？我来帮你处理。`,
            `收到！我正在处理你的请求："${text}"，请稍等...`
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
    
    // 语音合成
    speak(text) {
        return new Promise((resolve, reject) => {
            if (!this.synthesis) {
                reject(new Error('浏览器不支持语音合成'));
                return;
            }
            
            // 停止当前播放
            this.synthesis.cancel();
            
            // 创建话语
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
            utterance.rate = this.config.speechRate;
            
            // 事件监听
            utterance.onstart = () => {
                this.isSpeaking = true;
                this.updateStatus('正在说话...');
            };
            
            utterance.onend = () => {
                this.isSpeaking = false;
                this.updateStatus('准备就绪');
                resolve();
            };
            
            utterance.onerror = (event) => {
                this.isSpeaking = false;
                reject(event);
            };
            
            // 开始播放
            this.synthesis.speak(utterance);
        });
    }
    
    // 添加消息到对话
    addMessage(text, type) {
        const messageDiv = document.createElement('div');
        
        if (type === 'user') {
            messageDiv.className = 'user-message-wrapper';
            messageDiv.innerHTML = `<div class="message user">${this.escapeHtml(text)}</div>`;
        } else {
            messageDiv.className = 'welcome';
            messageDiv.innerHTML = `
                <div class="bot-avatar">🤖</div>
                <div class="message bot">${this.escapeHtml(text)}</div>
            `;
        }
        
        this.conversation.appendChild(messageDiv);
        this.scrollToBottom();
        
        // 保存到历史
        this.conversationHistory.push({
            text,
            type,
            timestamp: Date.now()
        });
        this.saveConversationHistory();
    }
    
    // 更新UI
    updateUI(state) {
        if (state === 'listening') {
            this.voiceButton.classList.add('listening');
            this.hint.textContent = '正在聆听...';
            this.updateTranscript('请说话...', 'listening');
        } else {
            this.voiceButton.classList.remove('listening');
            this.hint.textContent = '按住说话';
            this.updateTranscript('点击麦克风开始对话...', 'idle');
        }
    }
    
    // 更新状态
    updateStatus(text) {
        this.statusText.textContent = text;
    }
    
    // 更新识别文本
    updateTranscript(text, state) {
        const transcriptText = this.transcript.querySelector('.transcript-text');
        transcriptText.textContent = text;
        transcriptText.className = `transcript-text ${state}`;
    }
    
    // 显示错误
    showError(message) {
        this.updateStatus(message);
        this.updateTranscript(message, 'error');
        
        setTimeout(() => {
            this.updateStatus('准备就绪');
        }, 3000);
    }
    
    // 滚动到底部
    scrollToBottom() {
        this.conversation.scrollTop = this.conversation.scrollHeight;
    }
    
    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 保存配置
    saveConfig() {
        localStorage.setItem('toki_config', JSON.stringify(this.config));
    }
    
    // 加载配置
    loadConfig() {
        const saved = localStorage.getItem('toki_config');
        if (saved) {
            this.config = { ...this.config, ...JSON.parse(saved) };
            
            // 更新UI
            document.getElementById('wakeWordEnabled').checked = this.config.wakeWordEnabled;
            document.getElementById('speechRate').value = this.config.speechRate;
            document.getElementById('offlineMode').checked = this.config.offlineMode;
        }
    }
    
    // 保存对话历史
    saveConversationHistory() {
        localStorage.setItem('toki_history', JSON.stringify(this.conversationHistory.slice(-50)));
    }
    
    // 加载对话历史
    loadConversationHistory() {
        const saved = localStorage.getItem('toki_history');
        if (saved) {
            this.conversationHistory = JSON.parse(saved);
            
            // 恢复历史消息
            this.conversationHistory.forEach(msg => {
                this.addMessage(msg.text, msg.type);
            });
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.toki = new VoiceAssistant();
    console.log('🤖 TOKI语音助手已启动');
});

// 测试命令（浏览器控制台使用）
window.TOKI = {
    clearHistory: () => {
        localStorage.removeItem('toki_history');
        location.reload();
    },
    
    testSpeak: (text) => {
        window.toki.speak(text);
    },
    
    testRecognize: () => {
        window.toki.startListening();
    }
};
