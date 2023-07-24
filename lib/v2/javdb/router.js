module.exports = function (router) {
    router.get('/actors/:id/:filter?', require('./actors'));
    router.get('/home/:category?/:sort?/:filter?', require('./index'));
    router.get('/lists/:id/:filter?/:sort?', require('./lists'));
    router.get('/makers/:id/:filter?', require('./makers'));
    router.get('/rankings/:category?/:time?', require('./rankings'));
    router.get('/search/:keyword?/:filter?/:sort?', require('./search'));
    router.get('/series/:id/:filter?', require('./series'));
    router.get('/tags/:query?/:category?', require('./tags'));
    router.get('/:category?/:sort?/:filter?', require('./index'));
};
