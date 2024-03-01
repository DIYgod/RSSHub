export default (router) => {
    router.get('/author/:author', './author');
    router.get('/category/:category?', './category');
};
