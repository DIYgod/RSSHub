module.exports = {
    'panewslab.com': {
        _name: 'PANews',
        '.': [
            {
                title: '深度',
                docs: 'https://docs.rsshub.app/new-media.html#panews-shen-du',
                source: '/',
                target: '/panewslab/:category?',
            },
            {
                title: '快讯',
                docs: 'https://docs.rsshub.app/new-media.html#panews-kuai-xun',
                source: '/',
                target: '/panewslab/news',
            },
            {
                title: '专栏',
                docs: 'https://docs.rsshub.app/new-media.html#panews-zhuan-lan',
                source: '/',
                target: '/panewslab/author/:id',
            },
            {
                title: '专题',
                docs: 'https://docs.rsshub.app/new-media.html#panews-zhuan-ti',
                source: '/',
                target: '/panewslab/topic/:id',
            },
        ],
    },
};
