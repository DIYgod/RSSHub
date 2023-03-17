module.exports = function (router) {
    router.get('/news/:type?/:pageId?', require('./news/news'));
};
