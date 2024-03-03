export default {
    '423down.com': {
        _name: '423down',
        www: [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/routes/bbs#423down',
                source: '/',
                target: '/423down/index/all',
            },
            {
                title: '安卓软件',
                docs: 'https://docs.rsshub.app/routes/bbs#423down',
                source: '/:type',
                target: (params) => {
                    if (params.type === 'apk') {
                        return '/423down/android/apk';
                    }
                },
            },
            {
                title: '原创软件',
                docs: 'https://docs.rsshub.app/routes/bbs#423down',
                source: '/:type',
                target: (params) => {
                    if (params.type === 'zd423') {
                        return '/423down/computer/originalsoft';
                    }
                },
            },
            {
                title: '媒体播放',
                docs: 'https://docs.rsshub.app/routes/bbs#423down',
                source: '/:type',
                target: (params) => {
                    if (params.type === 'multimedia') {
                        return '/423down/computer/multimedia';
                    }
                },
            },
            {
                title: '网页浏览',
                docs: 'https://docs.rsshub.app/routes/bbs#423down',
                source: '/:type',
                target: (params) => {
                    if (params.type === 'browser') {
                        return '/423down/computer/browser';
                    }
                },
            },
            {
                title: '图形图像',
                docs: 'https://docs.rsshub.app/routes/bbs#423down',
                source: '/:type',
                target: (params) => {
                    if (params.type === 'image') {
                        return '/423down/computer/image';
                    }
                },
            },
            {
                title: '聊天软件',
                docs: 'https://docs.rsshub.app/routes/bbs#423down',
                source: '/:type',
                target: (params) => {
                    if (params.type === 'im') {
                        return '/423down/computer/im';
                    }
                },
            },
            {
                title: '办公软件',
                docs: 'https://docs.rsshub.app/routes/bbs#423down',
                source: '/:type',
                target: (params) => {
                    if (params.type === 'work') {
                        return '/423down/computer/work';
                    }
                },
            },
            {
                title: '上传下载',
                docs: 'https://docs.rsshub.app/routes/bbs#423down',
                source: '/:type',
                target: (params) => {
                    if (params.type === 'down') {
                        return '/423down/computer/down';
                    }
                },
            },
            {
                title: '系统辅助',
                docs: 'https://docs.rsshub.app/routes/bbs#423down',
                source: '/:type',
                target: (params) => {
                    if (params.type === 'systemsoft') {
                        return '/423down/computer/systemsoft';
                    }
                },
            },
            {
                title: '系统必备',
                docs: 'https://docs.rsshub.app/routes/bbs#423down',
                source: '/:type',
                target: (params) => {
                    if (params.type === 'systemplus') {
                        return '/423down/computer/systemplus';
                    }
                },
            },
            {
                title: '安全软件',
                docs: 'https://docs.rsshub.app/routes/bbs#423down',
                source: '/:type',
                target: (params) => {
                    if (params.type === 'security') {
                        return '/423down/computer/security';
                    }
                },
            },
            {
                title: '补丁相关',
                docs: 'https://docs.rsshub.app/routes/bbs#423down',
                source: '/:type',
                target: (params) => {
                    if (params.type === 'patch') {
                        return '/423down/computer/patch';
                    }
                },
            },
            {
                title: '硬件相关',
                docs: 'https://docs.rsshub.app/routes/bbs#423down',
                source: '/:type',
                target: (params) => {
                    if (params.type === 'hardwork') {
                        return '/423down/computer/hardware';
                    }
                },
            },
            {
                title: 'windows 11',
                docs: 'https://docs.rsshub.app/routes/bbs#423down',
                source: '/:type',
                target: (params) => {
                    if (params.type === 'win11') {
                        return '/423down/os/win11';
                    }
                },
            },
            {
                title: 'windows 10',
                docs: 'https://docs.rsshub.app/routes/bbs#423down',
                source: '/:type',
                target: (params) => {
                    if (params.type === 'win10') {
                        return '/423down/os/win10';
                    }
                },
            },
            {
                title: 'windows 7',
                docs: 'https://docs.rsshub.app/routes/bbs#423down',
                source: '/:type',
                target: (params) => {
                    if (params.type === 'win7') {
                        return '/423down/os/win7';
                    }
                },
            },
            {
                title: 'windows xp',
                docs: 'https://docs.rsshub.app/routes/bbs#423down',
                source: '/:type',
                target: (params) => {
                    if (params.type === 'winxp') {
                        return '/423down/os/winxp';
                    }
                },
            },
            {
                title: 'windows pe',
                docs: 'https://docs.rsshub.app/routes/bbs#423down',
                source: '/:type',
                target: (params) => {
                    if (params.type === 'winpe') {
                        return '/423down/os/winpe';
                    }
                },
            },
        ],
    },
};
