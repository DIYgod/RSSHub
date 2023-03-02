module.exports = function (router) {
    router.get('/blog', require('./blog'));
    router.get('/weekly', require('./weekly'));
};
