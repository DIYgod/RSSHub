module.exports = function (router) {
    router.get('/home/:category?/:sort?/:filter?', require('./index'));
    router.get('/search/:keyword?/:filter?', require('./search'));
    router.get('/tags/:query?/:category?', require('./tags'));
    router.get('/actors/:id/:filter?', require('./actors'));
    router.get('/makers/:id/:filter?', require('./makers'));
    router.get('/series/:id/:filter?', require('./series'));
    router.get('/rankings/:category?/:time?', require('./rankings'));
    router.get('/:category?/:sort?/:filter?', require('./index'));
};
