module.exports = (router) => {
    router.get('/bmie/:type', require('./bmie'));
    router.get('/news/:type', require('./news'));
};
