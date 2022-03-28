module.exports = {
    'latepost.com': {
        _name: '晚点 Latepost',
        '.': [
            {
                title: '报道',
                docs: 'https://docs.rsshub.app/new-media.html#wan-dian-latepost-bao-dao',
                source: '/',
                target: (params, url) => `/latepost/${new URL(url).searchParams.get('proma')}`,
            },
        ],
    },
};
