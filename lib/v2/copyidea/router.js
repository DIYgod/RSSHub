module.exports = function (router) {
    router.get('/link/:token', require('./link'));
};
