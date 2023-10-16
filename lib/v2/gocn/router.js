module.exports = function (router) {
    router.get('/', require('./news'));
    router.get('/news', require('./news'));
    router.get('/topics', require('./topics'));
    router.get('/jobs', require('./jobs'));
};
