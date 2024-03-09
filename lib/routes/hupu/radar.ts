export default {
    'hupu.com': {
        _name: '虎扑',
        '': [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/routes/bbs#hu-pu-shou-ye',
                source: ['/:category', '/'],
                target: '/hupu/:category',
            },
        ],
        bbs: [
            {
                title: '热帖',
                docs: 'https://docs.rsshub.app/routes/bbs#hu-pu-re-tie',
                source: ['/:id'],
                target: '/hupu/all/:id',
            },
        ],
        m: [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/routes/bbs#hu-pu-shou-ye',
                source: ['/:category', '/'],
                target: '/hupu/:category',
            },
            {
                title: '社区',
                docs: 'https://docs.rsshub.app/routes/bbs#hu-pu-she-qu',
                source: ['/bbs/:id', '/'],
                target: '/hupu/bbs/:id/:order',
            },
        ],
    },
};
