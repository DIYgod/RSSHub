export default {
    'cngal.org': {
        _name: 'CnGal',
        www: [
            {
                title: '每周速报',
                docs: 'https://docs.rsshub.app/routes/anime#cngal-mei-zhou-su-bao',
                source: ['/', '/weeklynews'],
                target: '/cngal/weekly',
            },
            {
                title: '制作者/游戏新闻',
                docs: 'https://docs.rsshub.app/routes/anime#cngal-zhi-zuo-zhe-you-xi-xin-wen',
                source: ['/entries/index/:id'],
                target: '/cngal/entry/:id',
            },
        ],
    },
};
