module.exports = function (router) {
    router.get('/hr/:category?', require('./hr'));
    router.get('/pgs/:type', require('./pgs'));
};
