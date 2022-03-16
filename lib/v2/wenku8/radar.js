module.exports = {
    'wenku8.net': {
        _name: '轻小说文库',
        www: [
            {
                title: '轻小说列表',
                docs: 'https://docs.rsshub.app/reading.html#qing-xiao-shuo-wen-ku-shou-ye-fen-lei',
                source: ['/modules/article/articlelist.php'],
                target: (_, url) => {
                    const fullflag = new URL(url).searchParams.get('fullflag');
                    if (!fullflag) {
                        return '/wenku8/fullflag';
                    }
                },
            },
            {
                title: '热门轻小说',
                docs: 'https://docs.rsshub.app/reading.html#qing-xiao-shuo-wen-ku-shou-ye-fen-lei',
                source: ['/modules/article/toplist.php'],
                target: (_, url) => {
                    const sort = new URL(url).searchParams.get('sort');
                    if (sort === 'allvisit') {
                        return '/wenku8/allvisit';
                    }
                },
            },
            {
                title: '动画化作品',
                docs: 'https://docs.rsshub.app/reading.html#qing-xiao-shuo-wen-ku-shou-ye-fen-lei',
                source: ['/modules/article/toplist.php'],
                target: (_, url) => {
                    const sort = new URL(url).searchParams.get('sort');
                    if (sort === 'anime') {
                        return '/wenku8/anime';
                    }
                },
            },
            {
                title: '新书一览',
                docs: 'https://docs.rsshub.app/reading.html#qing-xiao-shuo-wen-ku-shou-ye-fen-lei',
                source: ['/modules/article/toplist.php'],
                target: (_, url) => {
                    const sort = new URL(url).searchParams.get('sort');
                    if (sort === 'postdate') {
                        return '/wenku8/postdate';
                    }
                },
            },
            {
                title: '完结全本',
                docs: 'https://docs.rsshub.app/reading.html#qing-xiao-shuo-wen-ku-shou-ye-fen-lei',
                source: ['/modules/article/articlelist.php'],
                target: (_, url) => {
                    const fullflag = new URL(url).searchParams.get('fullflag');
                    if (fullflag === '1') {
                        return '/wenku8/fullflag';
                    }
                },
            },
            {
                title: '今日更新',
                docs: 'https://docs.rsshub.app/reading.html#qing-xiao-shuo-wen-ku-shou-ye-fen-lei',
                source: ['/modules/article/toplist.php'],
                target: (_, url) => {
                    const sort = new URL(url).searchParams.get('sort');
                    if (sort === 'lastupdate') {
                        return '/wenku8/lastupdate';
                    }
                },
            },
            {
                title: '章节',
                docs: 'https://docs.rsshub.app/reading.html#qing-xiao-shuo-wen-ku-zhang-jie',
                source: ['/book/:id'],
                target: (params) => `/wenku8/chapter/${params.id.split('.')[0]}`,
            },
            {
                title: '最新卷',
                docs: 'https://docs.rsshub.app/reading.html#qing-xiao-shuo-wen-ku-zui-xin-juan',
                source: ['/book/:id'],
                target: (params) => `/wenku8/volume/${params.id.split('.')[0]}`,
            },
        ],
    },
};
