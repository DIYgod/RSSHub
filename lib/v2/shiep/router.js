module.exports = function (router) {
    router.get('/:type/:id?', require('./index'));
    router.get('/yjsc/:type', require('./yjsc'));
};
