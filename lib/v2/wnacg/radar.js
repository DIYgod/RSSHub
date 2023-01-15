module.exports = {
    'wnacg.org': {
        _name: '紳士漫畫',
        '.': [
            {
                title: '最新',
                docs: 'https://docs.rsshub.app/anime.html#shen-shi-man-hua',
                source: ['/albums.html', '/'],
                target: '/wnacg',
            },
            {
                title: '分类更新',
                docs: 'https://docs.rsshub.app/anime.html#shen-shi-man-hua',
                source: ['/*'],
                target: (_, url) => `/wnacg/category/${new URL(url).pathname.match(/albums-index-cate-(\d+)\.html$/)[1]}`,
            },
            {
                title: '標籤更新',
                docs: 'https://docs.rsshub.app/anime.html#shen-shi-man-hua',
                source: ['/*'],
                target: (_, url) => `/wnacg/tag/${new URL(url).pathname.match(/albums-index-tag-(.+?)\.html$/)[1]}`,
            },
        ],
    },
};
