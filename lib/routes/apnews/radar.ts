export default {
    'apnews.com': {
        _name: 'AP News',
        '.': [
            {
                title: '话题',
                docs: 'https://docs.rsshub.app/routes/traditional-media#ap-news',
                source: '/hub/:topic',
                target: '/apnews/topics/:topic',
            },
        ],
    },
};
