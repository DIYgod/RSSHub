module.exports = function (router) {
    router.get('/', require('./news'));
    router.get('/jobs', require('./jobs'));
    router.get('/news', require('./news'));
    router.get('/topics', require('./topics'));
};
