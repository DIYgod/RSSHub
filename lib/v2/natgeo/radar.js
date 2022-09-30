module.exports = {
    'nationalgeographic.com': {
        _name: '国家地理',
        '.': [
            {
                title: '每日一图',
                docs: 'https://docs-rsshub.pages.dev/picture.html#guo-jia-di-li',
                source: ['/photo-of-the-day/*', '/'],
                target: '/natgeo/dailyphoto',
            },
        ],
    },
    'natgeomedia.com': {
        _name: '国家地理',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/travel.html#guo-jia-di-li',
                source: ['/:cat/:type', '/'],
                target: '/natgeo/:cat/:type',
            },
        ],
    },
};
