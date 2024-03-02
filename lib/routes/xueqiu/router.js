export default (router) => {
    router.get('/column/:id', './column');
    router.get('/favorite/:id', './favorite');
    router.get('/fund/:id', './fund');
    router.get('/hots', './hots');
    router.get('/snb/:id', './snb');
    router.get('/stock_comments/:id', './stock-comments');
    router.get('/stock_info/:id/:type?', './stock-info');
    router.get('/today', './today');
    router.get('/user/:id/:type?', './user');
    router.get('/user_stock/:id', './user-stock');
};
