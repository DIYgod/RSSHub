module.exports = (router) => {
    router.get('/user/:id', require('./timeline'));
    router.get('/user/:id/cast', require('./cast'));
    router.get('/user/:id/livestream', require('./livestream'));
};
