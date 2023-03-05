module.exports = function (router) {
    router.get('/new-arrivals/:country/:gender', require('./new-arrivals'));
};
