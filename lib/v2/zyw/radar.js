module.exports = {
    'zyw.asia': {
        _name: 'zyw',
        hot: [
            {
                title: '今日热榜',
                docs: 'https://docs.rsshub.app/new-media.html#zyw-jin-ri-re-bang',
                source: ['/#/list', '/'],
                target: (params, url) => `/zyw/hot/${new URL(url).searchParams.get('type')}`,
            },
        ],
    },
};
