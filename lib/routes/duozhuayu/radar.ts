export default {
    'duozhuayu.com': {
        _name: '多抓鱼',
        '.': [
            {
                title: '搜索结果',
                docs: 'https://docs.rsshub.app/routes/shopping#duo-zhua-yu',
                source: ['/search/book/:wd'],
                target: '/duozhuayu/search/:wd',
            },
        ],
    },
};
