module.exports = function (router) {
    router.get('/blog/:id?', require('./blog'));
    router.get('/news', require('./news'));
};
