export default {
    '8kcosplay.com': {
        _name: '8KCosplay',
        '.': [
            {
                title: '最新',
                docs: 'https://docs.rsshub.app/routes/picture#8kcosplay',
                source: ['/'],
                target: '/8kcos',
            },
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/picture#8kcosplay',
                source: ['/category/:cat*'],
                target: (params, url) => `/8kcos/cat/${new URL(url).pathname}`,
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/routes/picture#8kcosplay',
                source: ['/tag/:tag'],
                target: '/8kcos/tag/:tag',
            },
        ],
    },
};
