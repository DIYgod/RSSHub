module.exports = function (router) {
    router.get('/user/:uid', require('./user'));
};
