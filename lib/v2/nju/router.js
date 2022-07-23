module.exports = function (router) {
    router.get('/jw/:type', require('./jw'));
    router.get('/gra', require('./gra'));
    router.get('/rczp/:type', require('./rczp'));
    router.get('/scit/:type', require('./scit'));
    router.get('/zcc', require('./zcc'));
    router.get('/jjc', require('./jjc'));
    router.get('/admission', require('./admission'));
    router.get('/zbb/:type', require('./zbb'));
};
