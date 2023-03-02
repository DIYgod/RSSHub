module.exports = {
    'sinchew.com.my': {
        _name: '星洲网',
        '.': [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/traditional-media.html#xing-zhou-wang-shou-ye',
                source: ['/'],
                target: '/sinchew',
            },
            {
                title: '最新',
                docs: 'https://docs.rsshub.app/traditional-media.html#xing-zhou-wang-zui-xin',
                source: ['/latest', '/'],
                target: '/sinchew/latest',
            },
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/traditional-media.html#xing-zhou-wang-fen-lei',
                source: ['/category/:category', '/'],
                target: (params, url) => `/sinchew/category/${new URL(url).toString().match(/\/category\/(.*)$/)[1]}`,
            },
        ],
    },
};
