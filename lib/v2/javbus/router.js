module.exports = (router) => {
    router.get('/genre/:gid', require('./genre'));
    router.get('/home', require('./home'));
    router.get('/label/:labelid', require('./label'));
    router.get('/series/:seriesid', require('./series'));
    router.get('/star/:sid', require('./star'));
    router.get('/studio/:studioid', require('./studio'));
    router.get('/uncensored/home', require('./uncensored/home'));
    router.get('/uncensored/genre/:gid', require('./uncensored/genre'));
    router.get('/uncensored/series/:seriesid', require('./uncensored/series'));
    router.get('/uncensored/star/:sid', require('./uncensored/star'));
    router.get('/western/home', require('./western/home'));
    router.get('/western/genre/:gid', require('./western/genre'));
    router.get('/western/series/:seriesid', require('./western/series'));
    router.get('/western/star/:sid', require('./western/star'));
};
