module.exports = function (router) {
    router.get('/rail/:category?/:topic?', './rail');
};
