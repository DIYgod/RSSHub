module.exports = function (router) {
    router.get('/:type/:id', require('./source'));
    router.get('/focusread', require('./focusread'));
};
