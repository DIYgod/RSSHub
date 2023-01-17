module.exports = (router) => {
    router.get('/', require('./index'));
    router.get('/category/:cid', require('./index'));
    router.get('/tag/:tag', require('./index'));
};
