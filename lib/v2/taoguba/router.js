module.exports = function (router) {
    router.get('/blog/:id', require('./blog'));
    router.get('/index', require('./index'));
    router.get('/user/:id', require('./blog'));
    router.get('/:category?', require('./index'));
};
