module.exports = function (router) {
    router.get('/hashtag/:cid/:routeParams?', require('./hashtag'));
    router.get('/user/:uid/:routeParams?', require('./user'));
};
