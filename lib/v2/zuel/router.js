module.exports = function (router) {
    router.get('/notice', require('./notice'));
    router.get('/yzb/:type', require('./yzb'));
};
