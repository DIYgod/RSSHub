module.exports = {
    '18comic.org': {
        _name: '18comic 禁漫天堂',
        '.': [
            {
                title: '成人 A 漫',
                docs: 'https://docs.rsshub.app/anime.html#18comic-jin-man-tian-tang-cheng-ren-a-man',
                source: ['/'],
                target: '/18comic/:category?/:time?/:order?/:keyword?',
            },
            {
                title: '搜索',
                docs: 'https://docs.rsshub.app/anime.html#18comic-jin-man-tian-tang-sou-suo',
                source: ['/'],
                target: '/18comic/search/:option?/:category?:keyword?/:time?/:order?',
            },
            {
                title: '专辑',
                docs: 'https://docs.rsshub.app/anime.html#18comic-jin-man-tian-tang-zhuan-ji',
                source: ['/'],
                target: '/18comic/album/:id',
            },
            {
                title: '文庫',
                docs: 'https://docs.rsshub.app/anime.html#18comic-jin-man-tian-tang-wen-ku',
                source: ['/'],
                target: '/18comic/blogs/:category?',
            },
        ],
    },
};
