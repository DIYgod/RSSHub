module.exports = function (router) {
    router.get('/wjfb/:ministry', require('./wjfb'));
    router.get('/yjzj', require('./yjzj'));
};
