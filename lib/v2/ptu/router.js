module.exports = function (router) {
    router.get('/news/:type?/:pageId?', require('./news/news'));
    router.get('/www/:type?/:pageId?', require('./www/www'));
    router.get('/:campus/:path+/:pageId?', require('./campus'));
};
