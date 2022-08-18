module.exports = function (router) {
    router.get('/index/:type', require('./index'));
    router.get('/sxw/:type', require('./sxw'));
    router.get('/gra/:type', require('./gra'));
};
