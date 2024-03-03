export default {
    'ifeng.com': {
        _name: '凤凰网',
        feng: [
            {
                title: '大风号',
                docs: 'https://docs.rsshub.app/routes/new-media#feng-huang-wang',
                source: ['/author/:id'],
                target: '/ifeng/feng/:id/doc',
            },
        ],
        news: [
            {
                title: '资讯',
                docs: 'https://docs.rsshub.app/routes/new-media#feng-huang-wang-zi-xun',
                target: (params, url) => `/ifeng/news${new URL(url).toString().match(/ifeng\.com(.*?)$/)[1]}`,
            },
        ],
        ishare: [
            {
                title: '大风号',
                docs: 'https://docs.rsshub.app/routes/new-media#feng-huang-wang',
                source: ['/mediaShare/home/:id/media'],
                target: '/ifeng/feng/:id/doc',
            },
        ],
    },
};
