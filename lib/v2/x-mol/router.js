module.exports = (router) => {
    router.get('/news/:tag?', require('./news'));
    router.get('/paper/:type/:magazine', require('./paper'));
};
