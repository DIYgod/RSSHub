module.exports = function (router) {
    router.get('/cic/:type?', require('./cic'));
    router.get('/oaa/:type?', require('./oaa'));
    router.get('/yzb/:type?', require('./yzb'));
};
