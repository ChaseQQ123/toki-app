// 语音合成修复版

// 加载中文语音
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
            voice.name.includes('Google') // 某些设备上中文语音名称
        );
        
        if (this.chineseVoice) {
            console.log('✅ 已选择中文语音:', this.chineseVoice.name, this.chineseVoice.lang);
        } else {
            console.warn('⚠️ 未找到中文语音，将使用默认语音');
            // 使用第一个可用语音
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
}

// 语音合成（修复版）
async speak(text) {
    console.log('🗣️ 开始语音合成, 文本:', text.substring(0, 50) + '...');
    
    return new Promise((resolve, reject) => {
        if (!this.synthesis) {
            console.error('❌ 浏览器不支持语音合成');
            this.addMessage('⚠️ 浏览器不支持语音合成', 'bot');
            resolve();
            return;
        }
        
        // 停止当前播放（防止重叠）
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
            console.error('❌ 语音播放失败:', event.error);
            
            // 如果是中断错误，不显示消息
            if (event.error !== 'interrupted') {
                this.addMessage('💡 语音播放失败，请检查浏览器设置', 'bot');
            }
            
            resolve(); // 继续执行
        };
        
        // 添加到队列并开始播放
        try {
            this.synthesis.speak(utterance);
            console.log('✅ 语音已添加到播放队列');
            
            // 某些浏览器需要这个触发
            if (!this.synthesis.speaking) {
                console.log('⚠️ 语音未开始，尝试重新触发');
                setTimeout(() => {
                    if (!this.synthesis.speaking && this.isSpeaking) {
                        this.synthesis.speak(utterance);
                    }
                }, 100);
            }
        } catch (error) {
            console.error('❌ 语音合成异常:', error);
            resolve();
        }
    });
}

// 测试语音合成
testSpeech() {
    console.log('🧪 测试语音合成...');
    
    const testText = '你好，我是TOKI，语音功能测试成功！';
    
    if (this.synthesis) {
        const utterance = new SpeechSynthesisUtterance(testText);
        utterance.lang = 'zh-CN';
        
        utterance.onstart = () => console.log('✅ 测试语音开始');
        utterance.onend = () => console.log('✅ 测试语音结束');
        utterance.onerror = (e) => console.error('❌ 测试语音失败:', e);
        
        this.synthesis.speak(utterance);
    } else {
        console.error('❌ 浏览器不支持语音合成');
    }
}
