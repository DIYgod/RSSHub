module.exports = function (router) {
    router.get('/hr/:category?/:type?', require('./hr'));
};
