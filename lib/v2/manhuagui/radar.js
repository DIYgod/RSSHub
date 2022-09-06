const rules = [
    {
        title: '漫画柜个人订阅',
        docs: 'https://docs.rsshub.app/anime.html#kan-man-hua',
        source: '/user/book/shelf',
        target: '/manhuagui/subscribe',
    },
];
module.exports = {
    'manhuagui.com': {
        _name: '漫画柜',
        www: rules,
    },
    'mhgui.com': {
        _name: '漫画柜镜像站',
        www: rules,
    },
};
