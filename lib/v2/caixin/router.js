module.exports = (router) => {
    router.get('/article', require('./article'));
    router.get('/blog/:column', require('./blog'));
    router.get('/database', require('./database'));
    router.get('/k', require('./k'));
    router.get('/latest', require('./latest'));
    router.get('/:column/:category', require('./category'));
};
