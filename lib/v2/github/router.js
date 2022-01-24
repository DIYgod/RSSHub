module.exports = function (router) {
    router.get('/comments/:user/:repo/:type/:number', require('./comments'));
};
