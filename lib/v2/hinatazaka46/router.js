module.exports = function (router) {
    router.get('/news', require('./news'));
    router.get('/blog/:id?/:page?', require('./blog'));
};
