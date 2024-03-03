export default {
    'xiaohongshu.com': {
        _name: '小红书',
        '.': [
            {
                title: '用户笔记',
                docs: 'https://docs.rsshub.app/routes/social-media#xiao-hong-shu',
                source: '/user/profile/:user_id',
                target: '/xiaohongshu/user/:user_id/notes',
            },
            {
                title: '用户收藏',
                docs: 'https://docs.rsshub.app/routes/social-media#xiao-hong-shu',
                source: '/user/profile/:user_id',
                target: '/xiaohongshu/user/:user_id/collect',
            },
            {
                title: '专辑',
                docs: 'https://docs.rsshub.app/routes/social-media#xiao-hong-shu',
                source: '/board/:board_id',
                target: '/xiaohongshu/board/:board_id',
            },
        ],
    },
};
