module.exports = function (router) {
    router.get('/hottest', require('./hottest'));
    router.get('/:type', require('./index'));
};
