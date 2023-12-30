module.exports = function (router) {
    router.get('/author/:id', require('./author'));
    router.get('/column/:id', require('./author'));
    router.get('/news', require('./news'));
    router.get('/newsflash', require('./news'));
    router.get('/topic/:id', require('./topic'));
    router.get('/:category?', require('./index'));
};
