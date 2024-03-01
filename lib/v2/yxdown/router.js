module.exports = (router) => {
    router.get('/news/:category?', require('./news'));
    router.get('/recommend', require('./recommend'));
};
