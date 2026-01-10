// sw.js - Service Worker 核心逻辑

// 安装时强制跳过等待，立即接管
self.addEventListener('install', (event) => {
    self.skipWaiting();
    console.log('Service Worker Installed');
});

// 激活时立即控制所有页面
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
    console.log('Service Worker Activated');
});

// 监听主页面发来的消息
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'NOTIFY') {
        const title = event.data.title || '新消息';
        const delay = event.data.delay || 0;
        const options = {
            body: event.data.body || '内容',
            icon: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png', // 默认用GitHub图标测试
            vibrate: [200, 100, 200],
            tag: 'hajimi-notification',
            renotify: true
        };

        if (delay > 0) {
            setTimeout(() => {
                self.registration.showNotification(title, options);
            }, delay);
        } else {
            self.registration.showNotification(title, options);
        }
    }
});

// 监听通知点击事件
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    // 点击通知后打开或聚焦页面
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // 如果页面已经打开，聚焦它
            for (const client of clientList) {
                if (client.url.includes('index.html') || client.url.endsWith('/')) {
                    return client.focus();
                }
            }
            // 如果页面没打开，打开它
            if (clients.openWindow) {
                return clients.openWindow('./index.html');
            }
        })
    );
});
