export default {
    'worldjournal.com': {
        _name: '世界新聞網',
        '.': [
            {
                title: '新聞',
                docs: 'https://docs.rsshub.app/routes/new-media#shi-jie-xin-wen-wang',
                source: ['/wj/*path'],
                target: '/worldjournal/:path',
            },
        ],
    },
};
