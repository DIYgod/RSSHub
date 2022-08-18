module.exports = function (router) {
    router.get('/index/:type', require('./index'));
    router.get('/gra/:type', require('./gra'));
};
