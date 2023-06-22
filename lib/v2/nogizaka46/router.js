module.exports = function (router) {
    router.get('/news', require('./news'));
    router.get('/blog/:id?', require('./blog'));
};
