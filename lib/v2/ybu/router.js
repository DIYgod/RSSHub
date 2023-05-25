module.exports = function (router) {
    router.get('/grad/:type', require('./grad'));
};
