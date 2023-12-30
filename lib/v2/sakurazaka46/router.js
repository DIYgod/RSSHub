module.exports = function (router) {
    router.get('/blog/:id?/:page?', require('./blog'));
    router.get('/news', require('./news'));
};
