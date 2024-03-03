export default (router) => {
    router.get('/list/:id', './list');
    router.get('/', './lists');
    router.get('/:category{.+}', './lists');
};
