export default (router) => {
    router.get('/tab/:tab?', './tab');
    router.get('/tag/:tag', './tag');
    router.get('/category/:category', './category');
};
