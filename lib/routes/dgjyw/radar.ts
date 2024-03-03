export default {
    'dgjyw.com': {
        _name: '东莞教研网',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/other#dong-guan-jia-yan-wang-fen-lei',
                source: ['/'],
                target: (params, url) => `/dgjyw/${new URL(url).toString().match(/dgjyw\.com\/(.*)\.htm$/)[1]}`,
            },
        ],
    },
};
