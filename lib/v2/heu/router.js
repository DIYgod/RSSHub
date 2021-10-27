module.exports = function (router) {
    router.get('/yjsy/list/:id', require('./yjsy/list'));
    router.get('/job/bigemploy', require('./job/bigemploy'));
    router.get('/job/calendar', require('./job/calendar'));
    router.get('/job/list/:id', require('./job/list'));
    router.get('/gx/list/:column/:id?', require('./gx/list'));
    router.get('/gx/card/:column/:id?', require('./gx/card'));
    router.get('/uae/list/:id', require('./uae/list'));
};
