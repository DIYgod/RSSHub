module.exports = (router) => {
    router.get('/exclusive/:locale?', require('./'));
    router.get('/news/:locale?', require('./'));
    router.get('/:locale?', require('./'));
    router.get('/:type/:id/:locale?', require('./'));
};
