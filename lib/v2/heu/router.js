module.exports = function (router) {
    router.get('/yjsys/list/:id', require('./yjsy/list'));
    router.get('/jobs/bigemploy', require('./job/bigemploy'));
    router.get('/jobs/calendar', require('./job/calendar'));
    router.get('/jobs/list/:id', require('./job/list'));
    router.get('/gx/list/:column/:id?', require('./gx/list'));
    router.get('/gx/card/:column/:id?', require('./gx/card'));
    router.get('/uaes/list/:id', require('./uae/list'));
};
