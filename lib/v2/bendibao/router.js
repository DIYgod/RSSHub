module.exports = function (router) {
    router.get('/news/:city', require('./news'));
};
