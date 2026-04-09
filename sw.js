// TOKI Service Worker - 离线支持

const CACHE_NAME = 'toki-v1';
const urlsToCache = [
  '/voice-assistant/',
  '/voice-assistant/index.html',
  '/voice-assistant/voice-style.css',
  '/voice-assistant/enhanced-voice-app.js',
  '/manifest.json'
];

// 安装事件
self.addEventListener('install', (event) => {
  console.log('✅ TOKI Service Worker 安装中...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 缓存文件中...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ TOKI Service Worker 安装完成！');
        return self.skipWaiting();
      })
  );
});

// 激活事件
self.addEventListener('activate', (event) => {
  console.log('🔄 TOKI Service Worker 激活中...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ 删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ TOKI Service Worker 激活完成！');
      return self.clients.claim();
    })
  );
});

// 请求拦截
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 缓存命中，返回缓存
        if (response) {
          console.log('📦 从缓存返回:', event.request.url);
          return response;
        }

        // 没有缓存，从网络获取
        console.log('🌐 从网络获取:', event.request.url);
        return fetch(event.request).then((response) => {
          // 检查是否有效响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 克隆响应（因为响应流只能使用一次）
          const responseToCache = response.clone();

          // 添加到缓存
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // 离线时返回离线页面
        console.log('📴 离线模式');
        return caches.match('/voice-assistant/index.html');
      })
  );
});

// 消息事件
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🤖 TOKI Service Worker 已加载');
