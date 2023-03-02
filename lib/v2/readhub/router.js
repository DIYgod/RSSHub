module.exports = (router) => {
    // deprecated
    router.get('/category/:category?/:overview?', require('./index'));

    router.get('/:category?/:overview?', require('./index'));
};
