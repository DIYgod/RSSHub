module.exports = function (router) {
    router.get('/yzb/:type', require('./yzb/index'));
};
