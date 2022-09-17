module.exports = (router) => {
    router.get('/category/:cid', require('./category'));
    router.get('/newest', require('./newest'));
    router.get('/photography', require('./photography'));
};
