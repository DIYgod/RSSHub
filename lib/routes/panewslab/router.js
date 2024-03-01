export default (router) => {
    router.get('/author/:id', './author');
    router.get('/column/:id', './author');
    router.get('/news', './news');
    router.get('/newsflash', './news');
    router.get('/topic/:id', './topic');
    router.get('/:category?', './index');
};
