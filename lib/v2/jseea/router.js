module.exports = (router) => {
    router.get('/news/:type?', require('./news'));
};
