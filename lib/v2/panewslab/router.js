module.exports = function (router) {
    router.get('/column/:id', require('./column'));
    router.get('/newsflash/:language?', require('./newsflash'));
    router.get('/topic/:id', require('./topic'));
    router.get('/:category?', require('./index'));
};
