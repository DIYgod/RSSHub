module.exports = {
    'leiphone.com': {
        _name: '雷峰网',
        '.': [
            {
                title: '最新文章',
                docs: 'https://docs.rsshub.app/new-media.html#lei-feng-wang-zui-xin-wen-zhang',
                source: ['/'],
                target: '/leiphone',
            },
            {
                title: '栏目',
                docs: 'https://docs.rsshub.app/new-media.html#lei-feng-wang-lan-mu',
                source: ['/category/:catename'],
                target: '/leiphone/category/:catname',
            },
            {
                title: '业界资讯',
                docs: 'https://docs.rsshub.app/new-media.html#lei-feng-wang-ye-jie-zi-xun',
                source: ['/'],
                target: '/leiphone/newsflash',
            },
        ],
    },
};
