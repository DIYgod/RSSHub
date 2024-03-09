export default (router) => {
    router.get('/all/:id?', './all');
    router.get('/bbs/:id?/:order?', './bbs');
    router.get('/bxj/:id?/:order?', './bbs');
    router.get('/dept/:category?', './index');
    router.get('/:category?', './index');
};
