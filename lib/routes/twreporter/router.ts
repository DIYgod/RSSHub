export default (router) => {
    router.get('/newest', './newest');
    router.get('/category/:category', './category');
};
