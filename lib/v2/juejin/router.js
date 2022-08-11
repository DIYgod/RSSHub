module.exports = (router) => {
    router.get('/books', require('./books'));
    router.get('/category/:category', require('./category'));
    router.get('/collection/:collectionId', require('./collection'));
    router.get('/collections/:userId', require('./favorites'));
    router.get('/column/:id', require('./column'));
    router.get('/news/:id', require('./news'));
    router.get('/pins/:type?', require('./pins'));
    router.get('/posts/:id', require('./posts'));
    router.get('/shares/:userId', require('./shares'));
    router.get('/tag/:tag', require('./tag'));
    router.get('/trending/:category/:type', require('./trending'));
};
