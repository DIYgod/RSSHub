export default (router) => {
    router.get('/index', './index');
    router.get('/:category?', './category');
};
