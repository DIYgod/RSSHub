module.exports = function (router) {
    router.get('/new-arrivals/:category', require('./new-arrivals'));
};
