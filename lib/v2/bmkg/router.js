module.exports = function (router) {
    router.get('/earthquake', require('./earthquake'));
    router.get('/news', require('./news'));
};
