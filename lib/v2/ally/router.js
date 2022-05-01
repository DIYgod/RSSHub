module.exports = function (router) {
    router.get('/rail/:category?/:topic?', require('./rail'));
};
