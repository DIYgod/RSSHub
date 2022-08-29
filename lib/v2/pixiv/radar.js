module.exports = {
    'pixiv.net': {
        _name: 'Pixiv',
        www: [
            {
                title: '用户收藏',
                docs: 'https://docs.rsshub.app/social-media.html#pixiv',
                source: '/users/:id/bookmarks/artworks',
                target: '/pixiv/user/bookmarks/:id',
            },
            {
                title: '用户动态',
                docs: 'https://docs.rsshub.app/social-media.html#pixiv',
                source: '/users/:id',
                target: '/pixiv/user/:id',
            },
            {
                title: '用户小说',
                docs: 'https://docs.rsshub.app/social-media.html#pixiv',
                source: '/users/:id/novels',
                target: '/pixiv/user/novels/:id',
            },
            {
                title: '排行榜',
                docs: 'https://docs.rsshub.app/social-media.html#pixiv',
                source: '/ranking.php',
                target: (params, url) => `/pixiv/ranking/${new URL(url).searchParams.get('mode') || 'daily'}`,
            },
            {
                title: '关键词',
                docs: 'https://docs.rsshub.app/social-media.html#pixiv',
                source: ['/tags/:keyword', '/tags/:keyword/:type?'],
                target: (params, url) => `/pixiv/search/:keyword/${new URL(url).searchParams.get('order')}/${new URL(url).searchParams.get('mode')}`,
            },
            {
                title: '关注的新作品',
                docs: 'https://docs.rsshub.app/social-media.html#pixiv',
                source: '/bookmark_new_illust.php',
                target: '/pixiv/user/illustfollows',
            },
        ],
    },
};
