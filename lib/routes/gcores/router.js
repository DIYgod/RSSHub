export default (router) => {
    router.get('/category/:category', './category');
    router.get('/collections/:collection', './collection');
    router.get('/radios/:category?', './radio');
    router.get('/tag/:tag/:category?', './tag');
};
