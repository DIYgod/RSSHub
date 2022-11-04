module.exports = (router) => {
    router.get('/collection/:uid/:collectionId/:routeParams?', require('./collection'));
    router.get('/followings/:id/:routeParams?', require('./followings'));
    router.get('/keyword/:keyword/:routeParams?', require('./keyword'));
    router.get('/likes/:id/:routeParams?', require('./likes'));
    router.get('/list/:id/:name/:routeParams?', require('./list'));
    router.get('/media/:id/:routeParams?', require('./media'));
    router.get('/trends/:woeid?', require('./trends'));
    router.get('/user/:id/:routeParams?', require('./user'));
};
