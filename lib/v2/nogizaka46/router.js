module.exports = function (router) {
    router.get('/news', require('./news'));
    router.get('/blog', require('./blog'));
};
