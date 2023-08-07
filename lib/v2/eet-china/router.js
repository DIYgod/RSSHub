module.exports = function (router) {
    router.get('/mp/tags/:id', require('./mp/tags'));
    router.get('/mp/:category?', require('./mp'));
};
