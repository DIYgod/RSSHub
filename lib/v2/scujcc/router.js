module.exports = function (router) {
    router.get('/jwb/:category', require('./jwb'));
};
