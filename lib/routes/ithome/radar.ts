export default {
    'ithome.com': {
        _name: 'IT 之家',
        '.': [
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/routes/new-media#it-zhi-jia-zhuan-ti',
                source: ['/tag/:name'],
                target: '/ithome/tag/:name',
            },
            {
                title: '专题',
                docs: 'https://docs.rsshub.app/routes/new-media#it-zhi-jia-zhuan-ti',
                source: ['/zt/:id'],
                target: '/ithome/zt/:id',
            },
            {
                title: '24 小时阅读榜',
                docs: 'https://docs.rsshub.app/routes/new-media#it-zhi-jia-re-bang',
                source: ['/*'],
                target: '/ithome/ranking/24h',
            },
            {
                title: '7 天最热',
                docs: 'https://docs.rsshub.app/routes/new-media#it-zhi-jia-re-bang',
                source: ['/*'],
                target: '/ithome/ranking/7days',
            },
            {
                title: '月榜',
                docs: 'https://docs.rsshub.app/routes/new-media#it-zhi-jia-re-bang',
                source: ['/*'],
                target: '/ithome/ranking/monthly',
            },
        ],
        it: [
            {
                title: 'IT 资讯',
                docs: 'https://docs.rsshub.app/routes/new-media#it-zhi-jia-fen-lei-zi-xun',
                source: '/',
                target: '/ithome/it',
            },
        ],
        soft: [
            {
                title: '软件之家',
                docs: 'https://docs.rsshub.app/routes/new-media#it-zhi-jia-fen-lei-zi-xun',
                source: '/',
                target: '/ithome/soft',
            },
        ],
        win10: [
            {
                title: 'win10 之家',
                docs: 'https://docs.rsshub.app/routes/new-media#it-zhi-jia-fen-lei-zi-xun',
                source: '/',
                target: '/ithome/win10',
            },
        ],
        win11: [
            {
                title: 'win11 之家',
                docs: 'https://docs.rsshub.app/routes/new-media#it-zhi-jia-fen-lei-zi-xun',
                source: '/',
                target: '/ithome/win11',
            },
        ],
        iphone: [
            {
                title: 'iphone 之家',
                docs: 'https://docs.rsshub.app/routes/new-media#it-zhi-jia-fen-lei-zi-xun',
                source: '/',
                target: '/ithome/iphone',
            },
        ],
        ipad: [
            {
                title: 'ipad 之家',
                docs: 'https://docs.rsshub.app/routes/new-media#it-zhi-jia-fen-lei-zi-xun',
                source: '/',
                target: '/ithome/ipad',
            },
        ],
        android: [
            {
                title: 'android 之家',
                docs: 'https://docs.rsshub.app/routes/new-media#it-zhi-jia-fen-lei-zi-xun',
                source: '/',
                target: '/ithome/android',
            },
        ],
        digi: [
            {
                title: '数码之家',
                docs: 'https://docs.rsshub.app/routes/new-media#it-zhi-jia-fen-lei-zi-xun',
                source: '/',
                target: '/ithome/digi',
            },
        ],
        next: [
            {
                title: '智能时代',
                docs: 'https://docs.rsshub.app/routes/new-media#it-zhi-jia-fen-lei-zi-xun',
                source: '/',
                target: '/ithome/next',
            },
        ],
    },
    'ithome.com.tw': {
        _name: 'iThome',
        www: [
            {
                title: 'Feeds',
                docs: 'https://docs.rsshub.app/routes/new-media#ithome-tai-wan',
                source: ['/:category', '/:category/feeds'],
                target: '/ithome/tw/feeds/:category',
            },
        ],
    },
};
