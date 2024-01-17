module.exports = function (router) {
    router.get('/blog/:category*', require('./blog'));
    router.get('/desktop', require('./desktop'));
};
