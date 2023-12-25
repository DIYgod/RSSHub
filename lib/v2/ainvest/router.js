module.exports = (router) => {
    router.get('/article', require('./article'));
    router.get('/news', require('./news'));
};
