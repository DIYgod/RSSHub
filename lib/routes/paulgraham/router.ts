export default (router) => {
    router.get('/articles', './article');
    router.get('/essays', './article');
    router.get('/', './article');
};
