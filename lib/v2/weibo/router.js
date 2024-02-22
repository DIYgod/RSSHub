module.exports = (router) => {
    router.get('/friends/:routeParams?', require('./friends'));
    router.get('/group/:gid/:gname?/:routeParams?', require('./group'));
    router.get('/keyword/:keyword/:routeParams?', require('./keyword'));
    router.get('/oasis/user/:userid', require('./oasis/user'));
    router.get('/search/hot/:fulltext?', require('./search/hot'));
    router.get('/super_index/:id/:type?/:routeParams?', require('./super-index'));
    router.get('/timeline/:uid/:feature?/:routeParams?', require('./timeline'));
    router.get('/user/:uid/:routeParams?', require('./user'));
};
