export default {
    'tvb.com': {
        _name: '无线新闻',
        '.': [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/routes/traditional-media#wu-xian-xin-wen-xin-wen',
                source: ['/:language/:category', '/'],
                target: '/tvb/news/:category?/:language?',
            },
        ],
    },
};
