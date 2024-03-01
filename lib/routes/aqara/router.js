export default (router) => {
    router.get('/cn/news', './news');
    router.get('/community/:id?/:keyword?', './community');
    router.get('/:region/:type?', './region');
    router.get('*', './post');
};
