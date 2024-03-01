module.exports = function (router) {
    router.get('/news/:team', require('./news'));
};
