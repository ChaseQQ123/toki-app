// 处理用户输入（完整版 - 确保语音回复）
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
        console.log('🤖 AI回复:', response);
        
        // 添加AI消息
        this.addMessage(response, 'bot');
        
        // 🔊 强制语音合成回复
        console.log('🗣️ 准备语音合成...');
        await this.speak(response);
        
    } catch (error) {
        console.error('❌ 获取回复失败:', error);
        
        const errorMsg = '抱歉，我遇到了问题，请重试';
        this.addMessage(errorMsg, 'bot');
        
        // 即使出错也尝试语音回复
        await this.speak(errorMsg);
    }
    
    // 恢复状态
    this.updateStatus('准备就绪');
}
