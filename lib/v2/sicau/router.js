module.exports = function (router) {
    router.get('/zsjy/:category?', require('./zsjy'));
};
