module.exports = function (router) {
    router.get('/chapter/:id', './chapter');
    router.get('/volume/:id', './volume');
    router.get('/:category?', './index');
};
