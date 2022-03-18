module.exports = {
    'guancha.cn': {
        _name: '观察者网',
        '': [
            {
                title: '用户收藏',
                docs: 'https://docs.rsshub.app/new-media.html#guan-cha-zhe-wang',
                source: '/bookmark.php',
                target: (params, url) => `/pixiv/user/bookmarks/${new URL(url).searchParams.get('id')}`,
            },
        ],
    },
};
