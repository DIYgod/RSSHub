module.exports = function (router) {
    router.get('/news/:column?', require('./news'));
};
