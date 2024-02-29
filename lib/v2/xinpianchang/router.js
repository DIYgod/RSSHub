module.exports = (router) => {
    router.get('/discover/:params?', './');
    router.get('/rank/:category?', './rank');
    router.get('/:params?', './');
};
