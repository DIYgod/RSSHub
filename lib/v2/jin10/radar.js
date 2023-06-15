module.exports = {
    'jin10.com': {
        _name: '金十数据',
        '.': [
            {
                title: '市场快讯',
                docs: 'https://docs.rsshub.app/finance.html#jin-shi-shu-ju',
                source: ['/'],
                target: '/jin10',
            },
        ],
        xnews: [
            {
                title: '主题文章',
                docs: 'https://docs.rsshub.app/finance.html#jin-shi-shu-ju',
                source: ['/topic/:id'],
                target: '/jin10/topic/:id',
            },
        ],
    },
};
