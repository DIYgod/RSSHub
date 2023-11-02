module.exports = function (router) {
    router.get('/tag/:repo/:product?/:type?', require('./tag'));
};
