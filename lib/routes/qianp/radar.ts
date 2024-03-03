export default {
    'qianp.com': {
        _name: '千篇网',
        '.': [
            {
                title: '知识库／资讯',
                docs: 'https://docs.rsshub.app/routes/new-media#qian-pian-wang',
                source: ['/*path'],
                target: (params) => (params.path.endsWith('.html') ? null : `/qianp/news/${params.path}`),
            },
        ],
    },
};
