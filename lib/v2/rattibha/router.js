module.exports = function (router) {
    router.get('/user/:user', require('./user'));
};
