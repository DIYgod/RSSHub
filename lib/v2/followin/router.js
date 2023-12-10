module.exports = (router) => {
    router.get('/kol/:kolId/:lang?', require('./kol'));
    router.get('/news/:lang?', require('./news'));
    router.get('/tag/:tagId/:lang?', require('./tag'));
    router.get('/topic/:topicId/:lang?', require('./topic'));
    router.get('/:categoryId?/:lang?', require('./index'));
};
