module.exports = function (router) {
    router.get('/user/:uid/:routeParams?', require('./user'));
};
