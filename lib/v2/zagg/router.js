module.exports = function (router) {
    router.get('/new-arrivals/:query?', require('./new-arrivals'));
};
