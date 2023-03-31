module.exports = {
    'newzmz.com': {
        _name: 'NEW 字幕组',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/multimedia.html#new-zi-mu-zu',
                source: ['/'],
                target: '/newzmz',
            },
            {
                title: '指定剧集',
                docs: 'https://docs.rsshub.app/multimedia.html#new-zi-mu-zu',
                source: ['/view/:id'],
                target: (params) => `/newzmz/view/${params.id.replace('.html', '')}`,
            },
        ],
    },
};
