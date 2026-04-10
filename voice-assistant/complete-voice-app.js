// TOKI 语音助手 - 完整版（单文件）
// 集成语音识别 + 语音合成 + 视频通话

class TOKIVoiceAssistant {
    constructor() {
        // 状态
        this.isListening = false;
        this.isSpeaking = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.chineseVoice = null;
        
        // 配置
        this.config = {
            wakeWord: '嘿TOKI',
            wakeWordEnabled: true,
            speechRate: 1,
            offlineMode: false
        };
        
        // 对话历史
        this.conversationHistory = [];
        
        // 视频通话状态
        this.videoCall = {
            active: false,
            localStream: null
        };
        
        // 初始化
        this.init();
    }
    
    // 初始化
    init() {
        this.initSpeechRecognition();
        this.loadChineseVoice();
        this.initUI();
        this.initVideoCall();
        this.loadConfig();
        this.loadConversationHistory();
        
        console.log('✅ TOKI语音助手已启动');
    }
    
    // 加载中文语音（修复版）
    loadChineseVoice() {
        if (!this.synthesis) {
            console.error('❌ 浏览器不支持语音合成');
            this.showError('浏览器不支持语音合成');
            return;
        }
        
        const loadVoices = () => {
            const voices = this.synthesis.getVoices();
            console.log('🗣️ 可用语音数量:', voices.length);
            console.log('🗣️ 可用语音:', voices.map(v => `${v.name} (${v.lang})`));
            
            // 优先选择中文语音
            this.chineseVoice = voices.find(voice => 
                voice.lang === 'zh-CN' || 
                voice.lang.includes('zh') ||
                voice.name.includes('Chinese') ||
                voice.name.includes('中文') ||
                voice.name.includes('Google')
            );
            
            if (this.chineseVoice) {
                console.log('✅ 已选择中文语音:', this.chineseVoice.name, this.chineseVoice.lang);
            } else {
                console.warn('⚠️ 未找到中文语音，将使用默认语音');
                if (voices.length > 0) {
                    this.chineseVoice = voices[0];
                    console.log('✅ 使用默认语音:', this.chineseVoice.name);
                }
            }
        };
        
        // 立即加载
        loadVoices();
        
        // Chrome需要等待voiceschanged事件
        this.synthesis.onvoiceschanged = () => {
            console.log('📢 语音列表已更新');
            loadVoices();
        };
        
        // 延迟再次加载（某些设备需要）
        setTimeout(loadVoices, 100);
        setTimeout(loadVoices, 500);
        setTimeout(loadVoices, 1000);
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
        this.recognition.continuous = false;  // 单次识别
        this.recognition.interimResults = true;  // 实时结果
        this.recognition.lang = 'zh-CN';  // 中文
        this.recognition.maxAlternatives = 1;
        
        // 事件监听
        this.recognition.onstart = () => this.onRecognitionStart();
        this.recognition.onresult = (event) => this.onRecognitionResult(event);
        this.recognition.onerror = (event) => this.onRecognitionError(event);
        this.recognition.onend = () => this.onRecognitionEnd();
        
        console.log('✅ 语音识别已初始化');
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
        
        // 绑定语音按钮事件 - 支持移动端
        this.voiceButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleListening();
        });
        
        // 移动端触摸事件
        this.voiceButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.voiceButton.classList.add('touch-active');
        });
        
        this.voiceButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.voiceButton.classList.remove('touch-active');
            this.toggleListening();
        });
        
        // 设置面板
        this.settingsBtn.addEventListener('click', () => {
            this.settingsPanel.classList.add('active');
        });
        
        this.closeSettings.addEventListener('click', () => {
            this.settingsPanel.classList.remove('active');
        });
        
        // 设置变更
        document.getElementById('wakeWordEnabled')?.addEventListener('change', (e) => {
            this.config.wakeWordEnabled = e.target.checked;
            this.saveConfig();
        });
        
        document.getElementById('speechRate')?.addEventListener('input', (e) => {
            this.config.speechRate = parseFloat(e.target.value);
            this.saveConfig();
        });
        
        console.log('✅ UI已初始化');
    }
    
    // 初始化视频通话
    initVideoCall() {
        console.log('🎥 初始化视频通话...');
        
        // 添加视频通话按钮到头部
        const videoBtn = document.createElement('button');
        videoBtn.className = 'video-call-btn';
        videoBtn.innerHTML = '📹';
        videoBtn.title = '视频通话';
        videoBtn.id = 'videoCallBtn';
        videoBtn.style.cssText = `
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.2);
            border: none;
            font-size: 24px;
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            z-index: 10;
        `;
        
        // 点击事件
        videoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('📹 视频按钮被点击');
            this.toggleVideoCall();
        });
        
        // 添加到头部
        const header = document.querySelector('.voice-header');
        if (header) {
            header.style.position = 'relative';
            header.appendChild(videoBtn);
            console.log('✅ 视频按钮已添加到头部');
        } else {
            console.error('❌ 未找到头部元素');
        }
        
        // 创建视频容器（隐藏）
        this.createVideoContainer();
        
        console.log('✅ 视频通话已初始化');
    }
    
    // 创建视频容器
    createVideoContainer() {
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-container';
        videoContainer.id = 'videoContainer';
        videoContainer.innerHTML = `
            <div class="video-wrapper">
                <video id="localVideo" autoplay muted playsinline></video>
            </div>
            <div class="video-controls">
                <button id="endCallBtn" class="end-call-btn">结束通话</button>
                <button id="muteVideoBtn" class="mute-video-btn">关闭摄像头</button>
                <button id="muteAudioBtn" class="mute-audio-btn">静音</button>
            </div>
        `;
        
        document.querySelector('.voice-container').appendChild(videoContainer);
        
        // 绑定事件
        document.getElementById('endCallBtn').addEventListener('click', () => this.endVideoCall());
        document.getElementById('muteVideoBtn').addEventListener('click', () => this.toggleVideo());
        document.getElementById('muteAudioBtn').addEventListener('click', () => this.toggleAudio());
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
            this.showError('语音识别未初始化，请使用Chrome浏览器');
            return;
        }
        
        if (this.isSpeaking) {
            this.showError('请等我回答完再说话');
            return;
        }
        
        try {
            this.recognition.start();
            this.isListening = true;
            this.updateUI('listening');
            console.log('🎤 开始监听');
        } catch (error) {
            console.error('启动语音识别失败:', error);
            
            // 如果已经在监听，先停止再启动
            if (error.name === 'InvalidStateError') {
                this.recognition.stop();
                setTimeout(() => this.startListening(), 100);
            } else {
                this.showError('启动语音识别失败，请重试');
            }
        }
    }
    
    // 停止监听
    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
        }
        this.isListening = false;
        this.updateUI('idle');
        console.log('🔇 停止监听');
    }
    
    // 识别开始
    onRecognitionStart() {
        console.log('✅ 语音识别已启动');
        this.updateStatus('正在聆听...');
        this.updateTranscript('请说话...', 'listening');
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
            console.log('📝 识别结果:', finalTranscript);
            this.updateTranscript(finalTranscript, 'final');
            this.processUserInput(finalTranscript);
        }
    }
    
    // 识别错误
    onRecognitionError(event) {
        console.error('❌ 语音识别错误:', event.error);
        
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
            case 'aborted':
                errorMessage = '语音识别被中断';
                break;
        }
        
        this.showError(errorMessage);
        this.stopListening();
    }
    
    // 识别结束
    onRecognitionEnd() {
        console.log('🛑 语音识别已停止');
        this.isListening = false;
        this.updateUI('idle');
    }
    
    // 处理用户输入
    async processUserInput(text) {
        console.log('💬 用户输入:', text);
        
        // 停止监听
        this.stopListening();
        
        // 添加用户消息
        this.addMessage(text, 'user');
        
        // 显示思考状态
        this.updateStatus('思考中...');
        
        try {
            // 获取AI回复
            const response = await this.getAIResponse(text);
            
            // 添加AI消息
            this.addMessage(response, 'bot');
            
            // 语音合成回答
            await this.speak(response);
            
        } catch (error) {
            console.error('❌ 获取回复失败:', error);
            this.showError('抱歉，我遇到了问题，请重试');
        }
        
        // 恢复状态
        this.updateStatus('准备就绪');
    }
    
    // 获取AI回复（智谱AI）
    async getAIResponse(text) {
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
                    model: 'glm-4-flash',
                    messages: [{ role: 'user', content: text }],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });
            
            if (!response.ok) {
                throw new Error(`API错误: ${response.status}`);
            }
            
            const data = await response.json();
            return data.choices[0].message.content;
            
        } catch (error) {
            console.error('获取AI回复失败:', error);
            
            // 降级到本地回复
            const responses = {
                '你好': '你好！我是TOKI，很高兴为你服务！',
                '早上好': '早上好！今天天气真不错，祝你愉快！',
                '你是谁': '我是TOKI，你的AI语音助手。',
            };
            
            return responses[text.toLowerCase()] || 
                `网络连接失败，请检查网络后重试。`;
        }
    }
    
    // 语音合成（修复版）
    async speak(text) {
        console.log('🗣️ 开始语音合成, 文本长度:', text.length);
        
        return new Promise((resolve, reject) => {
            if (!this.synthesis) {
                console.error('❌ 浏览器不支持语音合成');
                this.addMessage('⚠️ 浏览器不支持语音合成', 'bot');
                resolve();
                return;
            }
            
            // 停止当前播放
            if (this.synthesis.speaking) {
                console.log('⏹️ 停止当前播放');
                this.synthesis.cancel();
            }
            
            // 创建话语
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
            utterance.rate = this.config.speechRate || 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            // 使用中文语音
            if (this.chineseVoice) {
                utterance.voice = this.chineseVoice;
                console.log('✅ 使用语音:', this.chineseVoice.name);
            } else {
                console.warn('⚠️ 未找到中文语音，使用默认');
            }
            
            // 事件监听
            utterance.onstart = () => {
                this.isSpeaking = true;
                this.updateStatus('🔊 正在说话...');
                console.log('🔊 语音播放开始');
            };
            
            utterance.onend = () => {
                this.isSpeaking = false;
                this.updateStatus('准备就绪');
                console.log('✅ 语音播放完成');
                resolve();
            };
            
            utterance.onerror = (event) => {
                this.isSpeaking = false;
                console.error('❌ 语音播放失败:', event.error);
                
                if (event.error !== 'interrupted') {
                    this.addMessage('💡 语音播放失败，请检查浏览器设置', 'bot');
                }
                
                resolve();
            };
            
            // 开始播放
            try {
                this.synthesis.speak(utterance);
                console.log('✅ 语音已添加到播放队列');
                
                // 某些浏览器需要触发
                setTimeout(() => {
                    if (!this.synthesis.speaking) {
                        console.log('⚠️ 语音未开始，重新触发');
                        this.synthesis.speak(utterance);
                    }
                }, 100);
            } catch (error) {
                console.error('❌ 语音合成异常:', error);
                resolve();
            }
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
        } else {
            this.voiceButton.classList.remove('listening');
            this.hint.textContent = '点击说话';
        }
    }
    
    // 更新状态
    updateStatus(text) {
        if (this.statusText) {
            this.statusText.textContent = text;
        }
    }
    
    // 更新识别文本
    updateTranscript(text, state) {
        const transcriptText = this.transcript?.querySelector('.transcript-text');
        if (transcriptText) {
            transcriptText.textContent = text;
            transcriptText.className = `transcript-text ${state}`;
        }
    }
    
    // 显示错误
    showError(message) {
        this.updateStatus(message);
        this.updateTranscript(message, 'error');
        
        setTimeout(() => {
            this.updateStatus('准备就绪');
            this.updateTranscript('点击麦克风开始对话...', 'idle');
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
    
    // ===== 视频通话功能 =====
    
    // 切换视频通话
    async toggleVideoCall() {
        console.log('🔄 切换视频通话, 当前状态:', this.videoCall.active);
        
        if (this.videoCall.active) {
            this.endVideoCall();
        } else {
            await this.startVideoCall();
        }
    }
    
    // 开始视频通话
    async startVideoCall() {
        console.log('🎥 开始视频通话...');
        
        try {
            this.updateStatus('📹 正在启动摄像头...');
            
            // 检查浏览器支持
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('浏览器不支持视频通话');
            }
            
            // 请求摄像头和麦克风权限
            console.log('📱 请求摄像头和麦克风权限...');
            this.videoCall.localStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: true
            });
            
            console.log('✅ 获得摄像头权限');
            
            // 显示本地视频
            const localVideo = document.getElementById('localVideo');
            if (localVideo) {
                localVideo.srcObject = this.videoCall.localStream;
                console.log('✅ 视频已绑定到元素');
            } else {
                console.error('❌ 未找到视频元素');
            }
            
            // 显示视频容器
            const videoContainer = document.getElementById('videoContainer');
            if (videoContainer) {
                videoContainer.style.display = 'flex';
                console.log('✅ 视频容器已显示');
            }
            
            this.videoCall.active = true;
            this.updateStatus('📹 视频通话中');
            
            this.addMessage('📹 视频通话已开始', 'bot');
            await this.speak('视频通话已开始，你能看到我吗？');
            
        } catch (error) {
            console.error('❌ 无法访问摄像头:', error);
            
            let errorMsg = '无法访问摄像头';
            if (error.name === 'NotAllowedError') {
                errorMsg = '摄像头权限被拒绝，请在浏览器设置中允许';
            } else if (error.name === 'NotFoundError') {
                errorMsg = '未找到摄像头设备';
            } else if (error.name === 'NotSupportedError') {
                errorMsg = '浏览器不支持视频通话，请使用Chrome浏览器';
            }
            
            this.addMessage(`❌ ${errorMsg}`, 'bot');
            await this.speak('抱歉，无法访问摄像头。');
            
            // 隐藏视频容器
            const videoContainer = document.getElementById('videoContainer');
            if (videoContainer) {
                videoContainer.style.display = 'none';
            }
        }
    }
    
    // 结束视频通话
    endVideoCall() {
        console.log('🔚 结束视频通话...');
        
        // 停止所有视频轨道
        if (this.videoCall.localStream) {
            this.videoCall.localStream.getTracks().forEach(track => {
                console.log('🛑 停止轨道:', track.kind);
                track.stop();
            });
        }
        
        // 清除视频元素
        const localVideo = document.getElementById('localVideo');
        if (localVideo) {
            localVideo.srcObject = null;
        }
        
        // 隐藏视频容器
        const videoContainer = document.getElementById('videoContainer');
        if (videoContainer) {
            videoContainer.style.display = 'none';
        }
        
        this.videoCall.active = false;
        this.updateStatus('准备就绪');
        
        this.addMessage('📹 视频通话已结束', 'bot');
        this.speak('视频通话已结束。');
    }
    
    // 切换视频
    toggleVideo() {
        if (this.videoCall.localStream) {
            const videoTrack = this.videoCall.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                const btn = document.getElementById('muteVideoBtn');
                if (btn) {
                    btn.textContent = videoTrack.enabled ? '关闭摄像头' : '开启摄像头';
                }
            }
        }
    }
    
    // 切换音频
    toggleAudio() {
        if (this.videoCall.localStream) {
            const audioTrack = this.videoCall.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                const btn = document.getElementById('muteAudioBtn');
                if (btn) {
                    btn.textContent = audioTrack.enabled ? '静音' : '取消静音';
                }
            }
        }
    }
    
    // ===== 存储 =====
    
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
            const wakeWordCheckbox = document.getElementById('wakeWordEnabled');
            const speechRateInput = document.getElementById('speechRate');
            
            if (wakeWordCheckbox) wakeWordCheckbox.checked = this.config.wakeWordEnabled;
            if (speechRateInput) speechRateInput.value = this.config.speechRate;
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
            
            // 不恢复历史消息，避免重复显示
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.toki = new TOKIVoiceAssistant();
    console.log('🤖 TOKI完整版语音助手已启动');
    console.log('✅ 语音识别已启用');
    console.log('✅ 语音合成已启用');
    console.log('✅ 视频通话已启用');
    
    // 添加测试按钮（调试用）
    setTimeout(() => {
        console.log('🧪 语音合成测试...');
        if (window.toki.synthesis) {
            const test = new SpeechSynthesisUtterance('语音功能已就绪');
            test.lang = 'zh-CN';
            window.toki.synthesis.speak(test);
        }
    }, 2000);
});

// 测试命令
window.TOKI = {
    clearHistory: () => {
        localStorage.removeItem('toki_history');
        location.reload();
    },
    
    testSpeak: (text) => {
        window.toki?.speak(text);
    },
    
    testRecognize: () => {
        window.toki?.startListening();
    }
};
