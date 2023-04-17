module.exports = function (router) {
    router.get('/career', require('./career'));
    router.get('/cse/:type?', require('./cse'));
    router.get('/gra/:type', require('./gra'));
    router.get('/mail/:type?', require('./mail'));
};
