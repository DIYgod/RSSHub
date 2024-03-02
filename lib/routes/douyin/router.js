export default (router) => {
    router.get('/hashtag/:cid/:routeParams?', './hashtag');
    router.get('/live/:rid', './live');
    router.get('/user/:uid/:routeParams?', './user');
};
