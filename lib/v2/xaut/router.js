module.exports = function (router) {
    router.get('/index/:category?', require('./index'));
    router.get('/jwc/:category?', require('./jwc'));
    router.get('/rsc/:category?', require('./rsc'));
    router.get('/yjsy/:type', require('./yjsy'));
};
