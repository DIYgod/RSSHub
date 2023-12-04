module.exports = (router) => {
    router.get('/community', require('./community'));
    router.get('/datasets', require('./datasets'));
    router.get('/models', require('./models'));
    router.get('/studios', require('./studios'));
};
