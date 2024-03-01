module.exports = function (router) {
    router.get('/profile/:path', require('./profile'));
};
