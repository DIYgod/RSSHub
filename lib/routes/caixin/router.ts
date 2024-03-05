export default (router) => {
    router.get('/article', './article');
    router.get('/blog/:column?', './blog');
    router.get('/database', './database');
    router.get('/k', './k');
    router.get('/latest', './latest');
    router.get('/weekly', './weekly');
    router.get('/:column/:category', './category');
};
