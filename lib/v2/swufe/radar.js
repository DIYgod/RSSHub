module.exports = {
    'swufe.edu.cn': {
        _name: '西南财经大学',
        '.': [
            {
                title: '官网',
                docs: 'https://docs.rsshub.app/university.html#xi-nan-cai-jing-da-xue',
                source: ['/index/:category.htm'],
                target: '/swufe/www/:category',
            },
            {
                title: '教务处',
                docs: 'https://docs.rsshub.app/university.html#xi-nan-cai-jing-da-xue',
                source: ['/:category.htm'],
                target: '/swufe/jwc/:category',
            },
            {
                title: '研究生招生网',
                docs: 'https://docs.rsshub.app/university.html#xi-nan-cai-jing-da-xue',
                source: ['/web/xwtz/:category.htm'],
                target: '/swufe/yz/:category',
            },
        ],
    },
};
