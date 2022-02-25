module.exports = (router) => {
    // deprecated
    router.get('/category/:category?', require('./index'));

    router.get('/:category?', require('./index'));
};
