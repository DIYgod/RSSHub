module.exports = function (router) {
    // 杭州电子科技大学
    router.get('/cs', require('./cs/notice'));
    router.get('/cs/pg', require('./cs/pg'));
    router.get('/grs/:category', require('./grs'));
    router.get('/jwc/:category', require('./jwc'));
};
