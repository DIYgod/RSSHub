module.exports = {
    'xiaohongshu.com': {
        _name: '小红书',
        '.': [
            {
                title: '用户笔记',
                docs: 'https://docs.rsshub.app/social-media.html#xiao-hong-shu',
                source: '/user/profile/:user_id',
                target: '/xiaohongshu/user/:user_id/notes',
            },
            {
                title: '用户专辑',
                docs: 'https://docs.rsshub.app/social-media.html#xiao-hong-shu',
                source: '/user/profile/:user_id',
                target: '/xiaohongshu/user/:user_id/album',
            },
            {
                title: '专辑',
                docs: 'https://docs.rsshub.app/social-media.html#xiao-hong-shu',
                source: '/board/:board_id',
                target: '/xiaohongshu/board/:board_id',
            },
        ],
    },
};
