export default {
    'hinatazaka46.com': {
        _name: '日向坂46',
        '.': [
            {
                title: '公式ブログ',
                docs: 'https://docs.rsshub.app/routes/new-media#ban-dao-xi-lie-guan-wang-zi-xun-ri-xiang-ban-46-bo-ke',
                source: ['/s/official/diary/member/list', '/'],
                target: (params, url) => `/hinatazaka46/blog/${new URL(url).searchParams.get('ct')}`,
            },
            {
                title: 'ニュース',
                docs: 'https://docs.rsshub.app/routes/new-media#ban-dao-xi-lie-guan-wang-zi-xun-ri-xiang-ban-46-xin-wen',
                source: ['/s/official/news/list', '/'],
                target: '/hinatazaka46/news',
            },
        ],
    },
};
