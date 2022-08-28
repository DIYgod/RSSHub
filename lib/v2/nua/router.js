module.exports = function (router) {
    router.get('/dc/:type', require('./dc'));
    router.get('/gra/:type', require('./gra'));
    router.get('/index/:type', require('./index'));
    router.get('/sxw/:type', require('./sxw'));
};
