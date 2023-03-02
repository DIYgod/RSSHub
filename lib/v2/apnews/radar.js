module.exports = {
    'apnews.com': {
        _name: 'AP News',
        '.': [
            {
                title: '话题',
                docs: 'https://docs.rsshub.app/traditional-media.html#ap-news',
                source: '/hub/:topic',
                target: '/apnews/topics/:topic',
            },
        ],
    },
};
