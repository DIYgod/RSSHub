module.exports = function (router) {
    router.get('/new-arrivals/:country/:gender', require('./new-arrivals'));
    router.get('/outlet/:country/:gender', require('./outlet'));
    router.get('/regear/new-arrivals', require('./regear-new-arrivals'));
};
