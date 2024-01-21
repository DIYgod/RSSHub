module.exports = (router) => {
    router.get('/column/:id', require('./column'));
    router.get('/favorite/:id', require('./favorite'));
    router.get('/fund/:id', require('./fund'));
    router.get('/hots', require('./hots'));
    router.get('/snb/:id', require('./snb'));
    router.get('/stock_comments/:id', require('./stock-comments'));
    router.get('/stock_info/:id/:type?', require('./stock-info'));
    router.get('/today', require('./today'));
    router.get('/user/:id/:type?', require('./user'));
    router.get('/user_stock/:id', require('./user-stock'));
};
