module.exports = function (router) {
    router.get('/blogs/:tag', require('./blogs'));
    router.get('/channel/:name', require('./channel'));
    router.get('/user/:name', require('./user'));
};
