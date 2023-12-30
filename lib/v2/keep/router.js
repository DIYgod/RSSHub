module.exports = function (router) {
    router.get('/user/:id', require('./user'));
};
