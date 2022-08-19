module.exports = function (router) {
    router.get('/index/:type', require('./index'));
    router.get('/dc/:type', require('./dc'));
    router.get('/gra/:type', require('./gra'));
};
