// 网络连接测试

async function testConnection() {
    console.log('🧪 测试网络连接...');
    
    const testUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    
    try {
        // 测试1：检查是否能连接到智谱AI
        console.log('📡 测试智谱AI连接...');
        
        const response = await fetch(testUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer c4911cf15f844167bd26301e25622cf1.n1BU10ytXbnQ6N5d'
            },
            body: JSON.stringify({
                model: 'glm-4-flash',
                messages: [{role: 'user', content: '测试'}],
                max_tokens: 5
            })
        });
        
        console.log('📊 响应状态:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ 连接成功:', data);
            return true;
        } else {
            const error = await response.text();
            console.error('❌ 连接失败:', error);
            return false;
        }
        
    } catch (error) {
        console.error('❌ 网络错误:', error);
        console.error('错误类型:', error.name);
        console.error('错误信息:', error.message);
        
        // 可能的原因
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            console.error('💡 可能原因：');
            console.error('  1. CORS策略阻止（浏览器安全限制）');
            console.error('  2. 网络连接问题');
            console.error('  3. HTTPS/HTTP混合内容问题');
        }
        
        return false;
    }
}

// 运行测试
testConnection();
