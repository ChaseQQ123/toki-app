// TOKI 语音助手 - 视频通话修复版

// ===== 视频通话功能（修复） =====

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
    videoContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 1000;
        display: none;
        flex-direction: column;
    `;
    
    videoContainer.innerHTML = `
        <div class="video-wrapper" style="flex: 1; display: flex; align-items: center; justify-content: center;">
            <video id="localVideo" autoplay muted playsinline style="width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1);"></video>
        </div>
        <div class="video-controls" style="position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); display: flex; gap: 15px;">
            <button id="endCallBtn" style="padding: 12px 24px; border: none; border-radius: 25px; font-size: 16px; cursor: pointer; background: #ff4444; color: white;">结束通话</button>
            <button id="muteVideoBtn" style="padding: 12px 24px; border: none; border-radius: 25px; font-size: 16px; cursor: pointer; background: rgba(255, 255, 255, 0.9); color: #333;">关闭摄像头</button>
            <button id="muteAudioBtn" style="padding: 12px 24px; border: none; border-radius: 25px; font-size: 16px; cursor: pointer; background: rgba(255, 255, 255, 0.9); color: #333;">静音</button>
        </div>
    `;
    
    document.body.appendChild(videoContainer);
    
    // 绑定事件
    document.getElementById('endCallBtn').addEventListener('click', () => {
        console.log('🔚 结束通话按钮被点击');
        this.endVideoCall();
    });
    
    document.getElementById('muteVideoBtn').addEventListener('click', () => {
        console.log('🎥 切换摄像头');
        this.toggleVideo();
    });
    
    document.getElementById('muteAudioBtn').addEventListener('click', () => {
        console.log('🎤 切换麦克风');
        this.toggleAudio();
    });
    
    console.log('✅ 视频容器已创建');
}

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
            console.log('📹 视频状态:', videoTrack.enabled ? '开启' : '关闭');
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
            console.log('🎤 音频状态:', audioTrack.enabled ? '开启' : '静音');
        }
    }
}
