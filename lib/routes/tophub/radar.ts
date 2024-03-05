export default {
    'tophub.today': {
        _name: '今日热榜',
        '.': [
            {
                title: '榜单',
                docs: 'https://docs.rsshub.app/routes/new-media#jin-ri-re-bang-bang-dan',
                source: ['/n/:id'],
                target: '/tophub/:id',
            },
            {
                title: '榜单列表',
                docs: 'https://docs.rsshub.app/routes/new-media#jin-ri-re-bang-bang-dan-lie-biao',
                source: ['/n/:id'],
                target: '/tophub/list/:id',
            },
        ],
    },
};
