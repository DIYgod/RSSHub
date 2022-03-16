module.exports = (router) => {
    router.get('/news/:category?', require('./news'));
};
