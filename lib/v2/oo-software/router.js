module.exports = function (router) {
    router.get('/changelog/:id', require('./changelog'));
};
