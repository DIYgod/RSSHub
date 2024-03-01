module.exports = function (router) {
    router.get('/chapter/:id', require('./chapter'));
    router.get('/volume/:id', require('./volume'));
    router.get('/:category?', require('./index'));
};
