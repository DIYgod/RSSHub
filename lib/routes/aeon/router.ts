export default (router) => {
    router.get('/category/:category', './category');
    router.get('/:type', './type');
};
