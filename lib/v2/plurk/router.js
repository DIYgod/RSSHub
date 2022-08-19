module.exports = (router) => {
    router.get('/anonymous', require('./anonymous'));
    router.get('/hotlinks', require('./hotlinks'));
    router.get('/news/:lang?', require('./news'));
    router.get('/search/:keyword', require('./search'));
    router.get('/top/:category?/:lang?', require('./top'));
    router.get('/topic/:topic', require('./topic'));
    router.get('/user/:user', require('./user'));
};
