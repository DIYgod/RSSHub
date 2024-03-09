export default (router) => {
    router.get('/ac/comic/:id?', './ac/comic');
    router.get('/ac/rank/:type?/:time?', './ac/rank');
    router.get('/fact', './fact');
    router.get('/kg/:userId', './kg/user');
    router.get('/kg/reply/:playId', './kg/reply');
};
