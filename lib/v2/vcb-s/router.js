module.exports = (router) => {
    router.get('/', require('./index'));
    router.get('/category/:cat', require('./category'));
};
