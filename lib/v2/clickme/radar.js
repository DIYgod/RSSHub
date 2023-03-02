module.exports = {
    'clickme.net': {
        _name: 'ClickMe',
        '.': [
            {
                title: '文章',
                docs: 'https://docs.rsshub.app/other.html#clickme',
                source: ['/:grouping/:name'],
                target: (params) => `/clickme/default/${params.grouping === 't' ? 'tag' : 'category'}/${params.name}`,
            },
        ],
        r18: [
            {
                title: '文章',
                docs: 'https://docs.rsshub.app/other.html#clickme',
                source: ['/:grouping/:name'],
                target: (params) => `/clickme/r18/${params.grouping === 't' ? 'tag' : 'category'}/${params.name}`,
            },
        ],
    },
};
