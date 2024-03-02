export default (router) => {
    router.get('/friends/:routeParams?', './friends');
    router.get('/group/:gid/:gname?/:routeParams?', './group');
    router.get('/keyword/:keyword/:routeParams?', './keyword');
    router.get('/oasis/user/:userid', './oasis/user');
    router.get('/search/hot/:fulltext?', './search/hot');
    router.get('/super_index/:id/:type?/:routeParams?', './super-index');
    router.get('/timeline/:uid/:feature?/:routeParams?', './timeline');
    router.get('/user/:uid/:routeParams?', './user');
};
