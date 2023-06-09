module.exports = (router) => {
    router.get('/', require('./index'));
    router.get('/asia', require('./asia/index'));
    router.get(/\/cn([\w-/]+)?/, require('./cn/index'));
    router.get('/index', require('./index'));
    router.get('/:category/:article_type?', require('./news'));
};
