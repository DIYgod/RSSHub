module.exports = function (router) {
    router.get('/blog/:user', require('./blog'));
};
