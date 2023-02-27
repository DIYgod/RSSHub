module.exports = function (router) {
    // router.get('/blog/:name', require('./blog'));
    router.get('/channel/:name?', require('./channel'));
    // router.get('/user/:name', require('./user'));
};
