module.exports = {
    'zyw.asia': {
        _name: 'zyw',
        hot: [
            {
                title: '今日热榜',
                docs: 'https://docs.rsshub.app/new-media.html#zyw-jin-ri-re-bang',
                source: ['/'],
                target: (params, url) => {
                    const matches = new URL(url).href.match(/type=(\w+)/);
                    return `/zyw/hot${matches ? `/${matches[1]}` : ''}`;
                },
            },
        ],
    },
};
