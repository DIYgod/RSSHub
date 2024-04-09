module.exports = function (router) {
    router.get('/blog/:category*', require('./blog'));
};
