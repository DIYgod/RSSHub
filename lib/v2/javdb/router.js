module.exports = function (router) {
    router.get('/home/:category?/:sort?/:filter?', require('./index'));
    router.get('/search/:keyword?/:filter?/:sort?', require('./search'));
    router.get('/lists/:id/:filter?/:sort?', require('./lists'));
    router.get('/tags/:query?/:category?', require('./tags'));
    router.get('/actors/:id/:filter?', require('./actors'));
    router.get('/makers/:id/:filter?', require('./makers'));
    router.get('/series/:id/:filter?', require('./series'));
    router.get('/rankings/:category?/:time?', require('./rankings'));
    router.get('/:category?/:sort?/:filter?', require('./index'));
};
