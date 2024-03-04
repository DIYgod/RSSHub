export default (router) => {
    router.get('/books', './books');
    router.get('/category/:category', './category');
    router.get('/collection/:collectionId', './collection');
    router.get('/collections/:userId', './favorites');
    router.get('/column/:id', './column');
    router.get('/pins/:type?', './pins');
    router.get('/posts/:id', './posts');
    router.get('/tag/:tag', './tag');
    router.get('/trending/:category/:type', './trending');
};
