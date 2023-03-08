module.exports = function (router) {
    router.get('/new-arrivals/:country/:gender', require('./new-arrivals'));
    router.get('/regear/new-arrivals', require('./regear-new-arrivals'));
};
