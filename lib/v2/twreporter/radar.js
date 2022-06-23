module.exports = {
    'twreporter.org': {
        _name: '報導者',
        '.': [
            {
                title: '最新',
                docs: 'https://docs.rsshub.app/new-media.html#bao-dao-zhe',
                source: ['/'],
                target: '/twreporter/newest',
            },
            {
                title: '摄影',
                docs: 'https://docs.rsshub.app/new-media.html#bao-dao-zhe',
                source: ['/photography'],
                target: '/twreporter',
            },
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/new-media.html#bao-dao-zhe',
                source: ['/categories/:tid'],
                target: '/twreporter/category/:tid',
            },
        ],
    },
};
