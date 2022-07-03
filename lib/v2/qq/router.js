module.exports = function (router) {
    router.get('/ac/comic/:id?', require('./ac/comic'));
    router.get('/ac/rank/:type?/:time?', require('./ac/rank'));
    router.get('/kg/:userId', require('./kg/user'));
    router.get('/kg/reply/:playId', require('./kg/reply'));
    router.get('/live/:id', require('./live'));
};
