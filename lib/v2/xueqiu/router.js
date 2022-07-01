module.exports = (router) => {
    router.get('/column/:id', require('./column'));
    router.get('/favorite/:id', require('./favorite'));
    router.get('/fund/:id', require('./fund'));
    router.get('/hots', require('./hots'));
    router.get('/snb/:id', require('./snb'));
    router.get('/stock_comments/:id/:titleLength?', require('./stock_comments'));
    router.get('/stock_info/:id/:type?', require('./stock_info'));
    router.get('/user/:id/:type?', require('./user'));
    router.get('/user_stock/:id', require('./user_stock'));
};
