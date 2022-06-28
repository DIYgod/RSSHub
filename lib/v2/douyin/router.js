module.exports = function (router) {
    router.get('/hashtag/:cid/:routeParams?', require('./hashtag'));
    router.get('/live/:rid', require('./live'));
    router.get('/user/:uid/:routeParams?', require('./user'));
};
