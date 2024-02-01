module.exports = {
    'nicesss.com': {
        _name: 'Nicesss 呦糖社 ',
        www: [
            {
                title: '首页 Homepage',
                docs: 'https://docs.rsshub.app/routes/picture#you-tang-she',
                source: ['/', '/page/:page'],
                target: `/nicesss/`,
            },
            {
                title: '搜索 Search',
                source: ['/?s=*keyword', '/page/:page/?s=*keyword'],
                docs: 'https://docs.rsshub.app/routes/picture#you-tang-she',
                target: (_, url) => `/nicesss/search/${new URL(url).searchParams.get('s')}`,
            },
            {
                title: '标签 Tag',
                docs: 'https://docs.rsshub.app/routes/picture#you-tang-she',
                source: ['/archives/tag/:tag', '/archives/tag/:tag/page/:page?'],
                target: (params) => `/nicesss/tag/${params.tag}`,
            },
            {
                title: '类别 Category',
                docs: 'https://docs.rsshub.app/routes/picture#you-tang-she',
                source: ['/:category', '/:category/page/:page'],
                target: (params) => (params.category === 'archives' || params.category === 'page' ? `/nicesss/` : `/nicesss/category/${params.category}`),
            },
        ],
    },
};
