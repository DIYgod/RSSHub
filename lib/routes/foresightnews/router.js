export default (router) => {
    router.get('/article', './article');
    router.get('/column/:id', './column');
    router.get('/news', './news');
    router.get('/', './');
};
