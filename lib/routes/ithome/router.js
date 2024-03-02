export default (router) => {
    router.get('/ranking/:type', './ranking');
    router.get('/tag/:name', './tag');
    router.get('/tw/feeds/:category', './tw/feeds');
    router.get('/zt/:id', './zt');
    router.get('/:caty', './index');
};
