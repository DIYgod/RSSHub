module.exports = function (router) {
    router.get('/authors/:id/:slug', require('./authors'));
    router.get('/:site', require('./index'));
    router.get('/', require('./index'));
};
