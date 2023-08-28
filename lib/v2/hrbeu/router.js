module.exports = function (router) {
    router.get('/job/bigemploy', require('./job/bigemploy'));
    router.get('/job/calendar', require('./job/calendar'));
    router.get('/job/list/:id', require('./job/list'));
    router.get('/gx/card/:column/:id?', require('./gx/card'));
    router.get('/gx/list/:column/:id?', require('./gx/list'));
    router.get('/uae/:id', require('./uae/news'));
    router.get('/ugs/news/:author?/:category?', require('./ugs/news'));
    router.get('/yjsy/list/:id', require('./yjsy/list'));
};
