module.exports = function (router) {
    router.get('/hr/:category?/:type?', require('./hr'));
    router.get('/yjsy/:type', require('./yjsy'));
};
