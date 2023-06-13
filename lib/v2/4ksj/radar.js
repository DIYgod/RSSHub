module.exports = {
    '4ksj.com': {
        _name: '4k 世界',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/multimedia.html#4k-shi-jie-fen-lei',
                source: ['/forum-2-1.html', '/'],
                target: (params, url) => `/4ksj/forum/${new URL(url).href.match(/\/forum-([\w-]+)\.html/)[1]}`,
            },
        ],
    },
};
