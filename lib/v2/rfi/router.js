module.exports = function (router) {
    router.get('/news/:lang?', require('./news'));
};
