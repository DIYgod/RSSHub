module.exports = (router) => {
    router.get('/news/:category?', require('./news'));
    router.get('/topic/:topic', require('./topic'));
    router.get('/u/:uid', require('./user'));
    router.get('/user/:id', require('./user'));
};
