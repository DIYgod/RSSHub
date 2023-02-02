module.exports = (router) => {
    router.get('/', require('./home'));
    router.get('/news', require('./news'));
};
