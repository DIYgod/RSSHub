module.exports = function (router) {
    router.get('/new/:country/:category', require('./new'));
};
