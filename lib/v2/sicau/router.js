module.exports = function (router) {
    router.get('/dky/:category?', require('./dky'));
    router.get('/yan/:category?', require('./yan'));
    router.get('/zsjy/:category?', require('./zsjy'));
};
