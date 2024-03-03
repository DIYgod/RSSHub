export default {
    'sakurazaka46.com': {
        _name: '櫻坂46',
        '.': [
            {
                title: '公式ブログ',
                docs: 'https://docs.rsshub.app/routes/new-media#ban-dao-xi-lie-guan-wang-zi-xun-ying-ban-46-bo-ke',
                source: ['/s/s46/diary/blog/list', '/'],
                target: (params, url) => `/sakurazaka46/blog/${new URL(url).searchParams.get('ct')}`,
            },
            {
                title: 'ニュース',
                docs: 'https://docs.rsshub.app/routes/new-media#ban-dao-xi-lie-guan-wang-zi-xun-ying-ban-46-xin-wen',
                source: ['/s/s46/news/list', '/'],
                target: '/sakurazaka46/news',
            },
        ],
    },
};
