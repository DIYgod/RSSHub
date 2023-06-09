module.exports = {
    'qianp.com': {
        _name: '千篇网',
        '.': [
            {
                title: '知识库／资讯',
                docs: 'https://docs.rsshub.app/new-media.html#qian-pian-wang',
                source: ['/*path'],
                target: (params) => (!params.path.endsWith('.html') ? `/qianp/news/${params.path}` : null),
            },
        ],
    },
};
