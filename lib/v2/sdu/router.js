module.exports = function (router) {
    router.get('/wh/news/:column?', require('./wh/news'));
};
