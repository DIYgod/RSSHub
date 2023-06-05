module.exports = function (router) {
    router.get('/grs/:type', require('./grs'));
};
