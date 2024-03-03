export default {
    'panewslab.com': {
        _name: 'PANews',
        '.': [
            {
                title: '深度',
                docs: 'https://docs.rsshub.app/routes/new-media#panews-shen-du',
                source: '/',
                target: '/panewslab/:category?',
            },
            {
                title: '快讯',
                docs: 'https://docs.rsshub.app/routes/new-media#panews-kuai-xun',
                source: '/',
                target: '/panewslab/news',
            },
            {
                title: '专栏',
                docs: 'https://docs.rsshub.app/routes/new-media#panews-zhuan-lan',
                source: '/',
                target: '/panewslab/author/:id',
            },
            {
                title: '专题',
                docs: 'https://docs.rsshub.app/routes/new-media#panews-zhuan-ti',
                source: '/',
                target: '/panewslab/topic/:id',
            },
        ],
    },
};
