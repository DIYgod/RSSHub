module.exports = (router) => {
    router.get('/gfxy/:category?/:page?', require('./gfxy'));
    router.get('/ied/:type?/:category?/:page?', require('./ied'));
    router.get('/jwc/:category?/:page?', require('./jwc'));
    router.get('/xky/:category?/:page?', require('./xky'));
};
