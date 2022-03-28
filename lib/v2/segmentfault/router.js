module.exports = function (router) {
    router.get('/channel/:name', require('./channel'));
    router.get('/user/:name', require('./user'));
};
