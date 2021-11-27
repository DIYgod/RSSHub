module.exports = {
    'ruancan.com': {
        _name: '软餐',
        '.': [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/new-media.html#ruan-can-shou-ye',
                source: ['/'],
                target: '/ruancan',
            },
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/new-media.html#ruan-can-fen-lei',
                source: ['/sort/:sort', '/'],
                target: '/ruancan/sort/:sort',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/new-media.html#ruan-can-biao-qian',
                source: ['/tag/:tag', '/'],
                target: '/ruancan/tag/:tag',
            },
        ],
    },
};
