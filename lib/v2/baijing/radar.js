module.exports = {
    'baijingapp.com': {
        _name: '白鲸出海',
        '.': [
            {
                title: '最新',
                docs: 'https://docs.rsshub.app/new-media.html#bai-jing-chu-hai',
                source: ['/article', '/'],
                target: '/baijing',
            },
            {
                title: '资讯',
                docs: 'https://docs.rsshub.app/new-media.html#bai-jing-chu-hai',
                source: ['/article', '/'],
                target: (params, url) => {
                    const matches = String(new URL(url)).match(/\/article\/type-(\d+)/);
                    return `/baijing${matches ? `/${matches[1]}` : ''}`;
                },
            },
        ],
    },
};
