module.exports = function (router) {
    router.get('/ranking/:type', require('./ranking'));
    router.get('/tag/:name', require('./tag'));
    router.get('/tw/feeds/:category', require('./tw/feeds'));
    router.get('/zt/:id', require('./zt'));
    router.get('/:caty', require('./index'));
};
