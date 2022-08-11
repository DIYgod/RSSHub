module.exports = function (router) {
    router.get('/admission', require('./admission'));
    router.get('/dafls', require('./dafls'));
    router.get('/gra', require('./gra'));
    router.get('/hqjt', require('./hqjt'));
    router.get('/jjc', require('./jjc'));
    router.get('/jw/:type', require('./jw'));
    router.get('/rczp/:type', require('./rczp'));
    router.get('/scit/:type', require('./scit'));
    router.get('/zbb/:type', require('./zbb'));
    router.get('/zcc', require('./zcc'));
};
