module.exports = function (router) {
    router.get('/contests', require('./contests'));
    router.get('/comments/:user', require('./comments'));
};
