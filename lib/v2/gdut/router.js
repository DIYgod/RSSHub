module.exports = function (router) {
    router.get('/oa_news/:type?', require('./oa-news'));
};
