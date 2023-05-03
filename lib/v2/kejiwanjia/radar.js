const rules = [
    {
        title: '科技玩家精选',
        docs: 'https://docs.rsshub.app/anime.html#kan-man-hua',  // 文档的地址,写完文档才有
        source: "/user/book/shelf", // 匹配的网址
        target: "/kejiwanjia/jingxuanpost", // 匹配路由的网址
    },
];
module.exports = {
    'kejiwanjia.com': {
        _name: '科技玩家',
        www: rules,
    },
};
