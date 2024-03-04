export default {
    'hkej.com': {
        _name: '信报财经新闻',
        '.': [
            {
                title: '即时新闻',
                docs: 'https://docs.rsshub.app/routes/traditional-media##xin-bao-cai-jing-xin-wen',
                source: ['/'],
                target: '/hkej/:category?',
            },
        ],
    },
};
