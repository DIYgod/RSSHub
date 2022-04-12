module.exports = function (router) {
    router.get('/blog/:type?/:time?/:sort?', require('./blog'));
    router.get('/user/:id', require('./user'));
};
