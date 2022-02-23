module.exports = (router) => {
    router.get('/motif/:mid', require('./motif'));
    router.get('/news/:category?', require('./news'));
    router.get('/newsflashes', require('./newsflashes'));
    router.get('/search/article/:keyword', require('./search/article'));
    router.get('/user/:uid', require('./user'));
};
