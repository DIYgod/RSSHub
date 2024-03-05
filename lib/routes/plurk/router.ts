export default (router) => {
    router.get('/anonymous', './anonymous');
    router.get('/hotlinks', './hotlinks');
    router.get('/news/:lang?', './news');
    router.get('/search/:keyword', './search');
    router.get('/top/:category?/:lang?', './top');
    router.get('/topic/:topic', './topic');
    router.get('/user/:user', './user');
};
