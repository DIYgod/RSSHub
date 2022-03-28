module.exports = {
    'dh.gov.hk': {
        _name: '香港卫生署',
        '.': [
            {
                title: '新闻公报',
                docs: 'https://docs.rsshub.app/government.html#xiang-gang-wei-sheng-shu-xin-wen-gong-bao',
                source: ['/'],
                target: '/hongkong/dh/:language?',
            },
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/government.html#xiang-gang-wei-sheng-fang-hu-zhong-xin-fen-lei',
                source: ['/'],
                target: '/hongkong/chp/:category?/:language?',
            },
        ],
    },
};
