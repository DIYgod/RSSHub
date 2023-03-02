module.exports = function (router) {
    router.get('/3days/:location', require('./3days'));
    router.get('/now/:location', require('./now'));
};
