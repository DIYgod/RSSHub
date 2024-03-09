export default {
    'xinpianchang.com': {
        _name: '新片场',
        '.': [
            {
                title: '发现',
                docs: 'https://docs.rsshub.app/routes/new-media#xin-pian-chang-fa-xian',
                source: ['/discover/:params'],
                target: (params, url) => {
                    url = new URL(url);
                    const path = params.params ?? url.href.match(/discover\/(article.*?)/)[1];

                    return `/xinpianchang/discover${path ? `/${path}` : ''}`;
                },
            },
            {
                title: '排行榜',
                docs: 'https://docs.rsshub.app/routes/new-media#xin-pian-chang-pai-hang-bang',
                source: ['/rank/:params'],
                target: (params, url) => {
                    const path = params.params.match(/article-(\w+)-\d+-\d+/)[1] ?? url.href.match(/rank\/article-(\w+)-\d+-\d+/)[1];

                    return `/xinpianchang/rank${path ? `/${path}` : ''}`;
                },
            },
        ],
    },
};
