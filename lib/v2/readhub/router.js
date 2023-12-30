module.exports = (router) => {
    router.get('/daily', require('./daily'));
    router.get('/:category?', require('./'));
};
