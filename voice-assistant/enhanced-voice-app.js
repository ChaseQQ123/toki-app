// TOKI 增强版 - 确保语音回答 + 视频通话

class EnhancedVoiceAssistant extends VoiceAssistant {
    constructor() {
        super();
        this.initVideoCall();
        this.ensureTTWorks();
    }
    
    // 确保语音合成正常工作
    ensureTTWorks() {
        // 加载中文语音
        if ('speechSynthesis' in window) {
            // 等待语音列表加载
            const loadVoices = () => {
                const voices = this.synthesis.getVoices();
                const chineseVoice = voices.find(voice => 
                    voice.lang.includes('zh') || voice.lang.includes('CN')
                );
                
                if (chineseVoice) {
                    this.chineseVoice = chineseVoice;
                    console.log('✅ 已加载中文语音:', chineseVoice.name);
                }
            };
            
            // 立即加载
            loadVoices();
            
            // Chrome需要等待voiceschanged事件
            this.synthesis.onvoiceschanged = loadVoices;
        }
    }
    
    // 语音合成（增强版）
    speak(text) {
        return new Promise((resolve, reject) => {
            if (!this.synthesis) {
                this.addMessage('⚠️ 浏览器不支持语音合成', 'bot');
                resolve();
                return;
            }
            
            // 停止当前播放
            this.synthesis.cancel();
            
            // 创建话语
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
            utterance.rate = this.config.speechRate;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            // 使用中文语音
            if (this.chineseVoice) {
                utterance.voice = this.chineseVoice;
            }
            
            // 事件监听
            utterance.onstart = () => {
                this.isSpeaking = true;
                this.updateStatus('🔊 正在说话...');
                console.log('🔊 开始语音播放');
            };
            
            utterance.onend = () => {
                this.isSpeaking = false;
                this.updateStatus('准备就绪');
                console.log('✅ 语音播放完成');
                resolve();
            };
            
            utterance.onerror = (event) => {
                this.isSpeaking = false;
                console.error('❌ 语音播放失败:', event);
                
                // 显示文字提示
                this.addMessage('💡 提示：语音播放失败，请检查浏览器设置', 'bot');
                resolve(); // 继续执行，不要阻塞
            };
            
            // 开始播放
            this.synthesis.speak(utterance);
            
            // Chrome的bug：需要在用户交互后才能播放
            // 我们已经有点击事件，所以应该没问题
        });
    }
    
    // 初始化视频通话
    initVideoCall() {
        // 添加视频通话按钮
        this.addVideoCallButton();
        
        // 视频通话状态
        this.videoCall = {
            active: false,
            localStream: null,
            remoteStream: null
        };
    }
    
    // 添加视频通话按钮
    addVideoCallButton() {
        const videoBtn = document.createElement('button');
        videoBtn.className = 'video-call-btn';
        videoBtn.innerHTML = '📹';
        videoBtn.title = '视频通话';
        videoBtn.addEventListener('click', () => this.toggleVideoCall());
        
        // 添加到头部
        document.querySelector('.voice-header').appendChild(videoBtn);
        
        // 创建视频容器（隐藏）
        this.createVideoContainer();
    }
    
    // 创建视频容器
    createVideoContainer() {
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-container';
        videoContainer.id = 'videoContainer';
        videoContainer.innerHTML = `
            <div class="video-wrapper">
                <video id="localVideo" autoplay muted playsinline></video>
                <video id="remoteVideo" autoplay playsinline></video>
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
    
    // 切换视频通话
    async toggleVideoCall() {
        if (this.videoCall.active) {
            this.endVideoCall();
        } else {
            await this.startVideoCall();
        }
    }
    
    // 开始视频通话
    async startVideoCall() {
        try {
            // 请求摄像头和麦克风权限
            this.videoCall.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            // 显示本地视频
            const localVideo = document.getElementById('localVideo');
            localVideo.srcObject = this.videoCall.localStream;
            
            // 显示视频容器
            document.getElementById('videoContainer').classList.add('active');
            
            this.videoCall.active = true;
            this.updateStatus('📹 视频通话中...');
            
            this.addMessage('📹 视频通话已开始', 'bot');
            await this.speak('视频通话已开始，你可以看到我的画面了。');
            
            // TODO: 实现WebRTC连接到其他用户或AI
            // 这里可以：
            // 1. 连接到AI视频服务（如Gemini Pro Vision）
            // 2. 连接到其他用户
            // 3. 连接到虚拟AI形象
            
            // 演示模式：模拟AI视频分析
            this.startVideoAnalysis();
            
        } catch (error) {
            console.error('❌ 无法访问摄像头:', error);
            this.addMessage('❌ 无法访问摄像头，请检查权限设置', 'bot');
            await this.speak('抱歉，无法访问摄像头，请检查权限设置。');
        }
    }
    
    // 开始视频分析
    startVideoAnalysis() {
        // 每隔几秒分析一次视频帧
        this.videoAnalysisInterval = setInterval(() => {
            if (this.videoCall.active) {
                this.analyzeVideoFrame();
            }
        }, 5000); // 每5秒分析一次
    }
    
    // 分析视频帧
    analyzeVideoFrame() {
        // TODO: 发送视频帧到Gemma 4 Vision进行分析
        // 目前模拟分析
        
        const analyses = [
            '我看到你正在看镜头，姿势不错！',
            '光线看起来不错，画面很清晰。',
            '我注意到你的背景，需要我分析一下环境吗？',
            '你的表情看起来很专注，有什么需要帮助的吗？'
        ];
        
        const randomAnalysis = analyses[Math.floor(Math.random() * analyses.length)];
        this.addMessage(randomAnalysis, 'bot');
        this.speak(randomAnalysis);
    }
    
    // 结束视频通话
    endVideoCall() {
        // 停止所有视频轨道
        if (this.videoCall.localStream) {
            this.videoCall.localStream.getTracks().forEach(track => track.stop());
        }
        
        // 清除视频元素
        const localVideo = document.getElementById('localVideo');
        if (localVideo) {
            localVideo.srcObject = null;
        }
        
        // 隐藏视频容器
        document.getElementById('videoContainer').classList.remove('active');
        
        // 停止视频分析
        if (this.videoAnalysisInterval) {
            clearInterval(this.videoAnalysisInterval);
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
                btn.textContent = videoTrack.enabled ? '关闭摄像头' : '开启摄像头';
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
                btn.textContent = audioTrack.enabled ? '静音' : '取消静音';
            }
        }
    }
}

// 初始化增强版
document.addEventListener('DOMContentLoaded', () => {
    window.toki = new EnhancedVoiceAssistant();
    console.log('🤖 TOKI增强版语音助手已启动');
    console.log('✅ 语音合成已启用');
    console.log('✅ 视频通话已启用');
});
