// sw.js - 哈基米离线通知服务

self.addEventListener('install', (event) => {
    self.skipWaiting(); // 强制立即接管
    console.log('Hakimi SW Installed');
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
    console.log('Hakimi SW Activated');
});

// 监听主页面发来的指令
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SCHEDULE_NOTIFY') {
        const { title, body, delay, charId } = event.data;
        
        console.log(`SW received schedule: ${title} in ${delay}ms`);

        // 使用 setTimeout 模拟定时推送
        // 注意：在移动端浏览器完全关闭或杀后台后，这个 Timer 可能会失效
        setTimeout(() => {
            self.registration.showNotification(title, {
                body: body,
                icon: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png', // 可以换成你的图标 URL
                vibrate: [200, 100, 200],
                tag: 'hakimi-offline-msg',
                data: {
                    charName: title,
                    text: body,
                    charId: charId,
                    url: self.registration.scope // 点击打开的链接
                }
            });
        }, delay);
    }
});

// 监听通知点击
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const notificationData = event.notification.data;

    // 点击后打开或聚焦页面
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // 1. 尝试找到已经打开的窗口
            for (const client of clientList) {
                if (client.url.includes('index.html') || client.url === notificationData.url) {
                    client.focus();
                    // 告诉页面：我是点击通知进来的，处理一下这条消息
                    client.postMessage({
                        type: 'OPEN_CHAT',
                        charName: notificationData.charName,
                        text: notificationData.text
                    });
                    return;
                }
            }
            // 2. 如果没打开，则新开窗口
            if (clients.openWindow) {
                return clients.openWindow('./index.html');
            }
        })
    );
});
