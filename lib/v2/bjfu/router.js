module.exports = (router) => {
    router.get('/grs', require('./grs'));
    router.get('/it/:type', require('./it/index'));
    router.get('/jwc/:type', require('./jwc/index'));
    router.get('/kjc', require('./kjc'));
    router.get('/news/:type', require('./news/index'));
};
