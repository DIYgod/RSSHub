module.exports = (router) => {
    router.get('/discover/:params?', require('./'));
    router.get('/rank/:category?', require('./rank'));
    router.get('/:params?', require('./'));
};
