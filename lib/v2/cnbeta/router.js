module.exports = function (router) {
    router.get('/:type/:id', require('./type'));
    router.get('/', require('./type'));
};
