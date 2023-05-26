module.exports = function (router) {
    router.get('/dky/:category?', require('./dky'));
    router.get('/yan/:type', require('./yan'));
    router.get('/zsjy/:category?', require('./zsjy'));
};
