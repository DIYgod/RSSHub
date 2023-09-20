module.exports = (router) => {
    // 主页 文章数量 默认为 20
    router.get('/index/:size?', require('./index'));
};
