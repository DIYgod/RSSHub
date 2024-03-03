export default {
    'thecover.cn': {
        _name: '封面新闻',
        '.': [
            {
                title: '频道',
                docs: 'https://docs.rsshub.app/routes/new-media#the-cover',
                source: ['/:id', '/'],
                target: (params) => `/thecover/channel/${params.id.replace('channel_', '')}`,
            },
        ],
    },
};
