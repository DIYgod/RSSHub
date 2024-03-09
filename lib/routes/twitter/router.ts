export default (router) => {
    router.get('/collection/:uid/:collectionId/:routeParams?', './collection');
    router.get('/followings/:id/:routeParams?', './followings');
    router.get('/keyword/:keyword/:routeParams?', './keyword');
    router.get('/likes/:id/:routeParams?', './likes');
    router.get('/list/:id/:name/:routeParams?', './list');
    router.get('/media/:id/:routeParams?', './media');
    router.get('/trends/:woeid?', './trends');
    router.get('/tweet/:id/status/:status/:original?', './tweet');
    router.get('/user/:id/:routeParams?', './user');
};
