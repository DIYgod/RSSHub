export default (router) => {
    router.get('/new', './new');
    router.get('/category/:category', './category');
};
