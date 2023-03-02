module.exports = {
    'ifeng.com': {
        _name: '凤凰网',
        '.': [
            {
                title: '大风号',
                docs: 'https://docs.rsshub.app/new-media.html#feng-huang-wang',
            },
        ],
        news: [
            {
                title: '资讯',
                docs: 'https://docs.rsshub.app/new-media.html#feng-huang-wang-zi-xun',
                target: (params, url) => `/ifeng/news${new URL(url).toString().match(/ifeng\.com(.*?)$/)[1]}`,
            },
        ],
    },
};
