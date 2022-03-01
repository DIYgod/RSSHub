module.exports = {
    'mwm.net.cn': {
        _name: '管理世界',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/journal.html#guan-li-shi-jie-fen-lei',
                source: ['/web/:category', '/'],
                target: '/mvm/:category?',
            },
        ],
    },
};
