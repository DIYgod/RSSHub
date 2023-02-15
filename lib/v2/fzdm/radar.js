module.exports = {
    'fffdm.com': {
        _name: '风之动漫',
        '.': [
            {
                title: '风之动漫-漫画',
                docs: 'https://docs.rsshub.app/government.html#an-hui-sheng-ke-ji-ting-ke-ji-zi-xun',
                source: ['/*'],
                target: (params, url) => `/fzdm/manhua/kjt${new URL(url).href.match(/kjt\.ah\.gov\.cn(.*)\/index.html/)[1] ?? ''}`,
            },
        ],
    },
};
