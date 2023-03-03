module.exports = {
    'qdaily.com': {
        _name: '好奇心日报',
        '.': [
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/new-media.html#hao-qi-xin-ri-bao',
                source: ['/tags/:id'],
                target: (params) => `/qdaily/tag/${params.id.replace('.html', '')}`,
            },
            {
                title: '栏目',
                docs: 'https://docs.rsshub.app/new-media.html#hao-qi-xin-ri-bao',
                source: ['/special_columns/:id'],
                target: (params) => `/qdaily/column/${params.id.replace('.html', '')}`,
            },
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/new-media.html#hao-qi-xin-ri-bao',
                source: ['/categories/:id'],
                target: (params) => `/qdaily/category/${params.id.replace('.html', '')}`,
            },
        ],
    },
};
