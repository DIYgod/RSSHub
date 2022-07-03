module.exports = function (router) {
    // 杭州电子科技大学
    router.get('/cs', require('./cs'));
    router.get('/cs/pg', require('./cs/pg'));
};
