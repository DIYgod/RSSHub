module.exports = (router) => {
    router.get('/', require('./index'));
    router.get('/index', require('./index'));
    router.get('/:category/:article_type?', require('./news'));
};
