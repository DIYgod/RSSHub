module.exports = function (router) {
    router.get('/hottest', './hottest');
    router.get('/:type', './index');
};
