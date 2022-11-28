module.exports = (router) => {
    router.get('/keyword/:keyword/:routeParams?', require('./keyword'));
    router.get('/oasis/user/:userid', require('./oasis/user'));
    router.get('/search/hot', require('./search/hot'));
    router.get('/super_index/:id/:type?/:routeParams?', require('./super_index'));
    router.get('/timeline/:uid/:feature?/:routeParams?', require('./timeline'));
    router.get('/user/:uid/:routeParams?', require('./user'));
};
