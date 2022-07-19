module.exports = function (router) {
    router.get('/cic/:type?', require('./cic'));
    router.get('/news/:type?', require('./news'));
    router.get('/oaa/:type?', require('./oaa'));
    router.get('/yzb/:type?', require('./yzb'));
};
