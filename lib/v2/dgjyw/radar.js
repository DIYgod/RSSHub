module.exports = {
    'dgjyw.com': {
        _name: '东莞教研网',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/other.html#dong-guan-jia-yan-wang-fen-lei',
                source: ['/'],
                target: (params, url) => `/dgjyw/${new URL(url).toString().match(/dgjyw\.com\/(.*)\.htm$/)[1]}`,
            },
        ],
    },
};
