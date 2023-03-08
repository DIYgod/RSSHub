module.exports = function (router) {
    router.get('/new-arrivals/:categories?/:brands?', require('./new-arrivals'));
};
