const rules = [
    {
        title: '漫画柜个人订阅',
        docs: 'https://docs.rsshub.app/routes/anime#kan-man-hua',
        source: '/user/book/shelf',
        target: '/manhuagui/subscribe',
    },
    {
        title: '漫画更新',
        docs: 'https://docs.rsshub.app/routes/anime#kan-man-hua',
        source: '/comic/:id/',
        target: '/manhuagui/comic/:id',
    },
];

export default {
    'manhuagui.com': {
        _name: '漫画柜',
        www: rules,
        tw: [
            {
                title: '漫画更新',
                docs: 'https://docs.rsshub.app/routes/anime#kan-man-hua',
                source: '/comic/:id/',
                target: '/manhuagui/twmanhuagui/comic/:id',
            },
        ],
    },
    'mhgui.com': {
        _name: '漫画柜镜像站',
        www: rules,
    },
};
