module.exports = function (router) {
    router.get('/author/:id?', require('./author'));
    router.get('/brief', require('./brief'));
    router.get('/feed/:id?', require('./feed'));
    router.get('/headline', require('./headline'));
    router.get('/latest', require('./latest'));
    router.get('/news/:id?', require('./news'));
    router.get('/video/:id?', require('./video'));
    router.get('/vip/:id?', require('./vip'));
};
