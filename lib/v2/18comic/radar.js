const _18comic = {
    _name: '禁漫天堂',
    '.': [
        {
            title: '成人 A 漫',
            docs: 'https://docs.rsshub.app/anime.html#jin-man-tian-tang-cheng-ren-a-man',
            source: ['/'],
            target: '/18comic/:category?/:time?/:order?/:keyword?',
        },
        {
            title: '搜索',
            docs: 'https://docs.rsshub.app/anime.html#jin-man-tian-tang-sou-suo',
            source: ['/'],
            target: '/18comic/search/:option?/:category?:keyword?/:time?/:order?',
        },
        {
            title: '专辑',
            docs: 'https://docs.rsshub.app/anime.html#jin-man-tian-tang-zhuan-ji',
            source: ['/'],
            target: '/18comic/album/:id',
        },
        {
            title: '文庫',
            docs: 'https://docs.rsshub.app/anime.html#jin-man-tian-tang-wen-ku',
            source: ['/'],
            target: '/18comic/blogs/:category?',
        },
    ],
};

module.exports = {
    '18comic.org': _18comic,
    '18comic.vip': _18comic,
    //
    'jmcomic.me': _18comic,
    'jmcomic1.me': _18comic,
    //
    'jmcomic.rocks': _18comic,
    'jmcomic1.rocks': _18comic,
    'jmcomic.group': _18comic,
};
