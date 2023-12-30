module.exports = function (router) {
    router.get('/cmse/:type?', require('./cmse'));
    router.get('/cs/:type?', require('./cs'));
    router.get('/epe/:type?', require('./epe'));
    router.get('/mech/:type?', require('./mech'));
    router.get('/sc/:type?', require('./sc'));
    router.get('/wh/news/:column?', require('./wh/news'));
    router.get('/wh/jwc/:column?', require('./wh/jwc'));
};
