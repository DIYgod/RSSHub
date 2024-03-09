export default (router) => {
    router.get('/report/:category', './report/index');
    router.get('/search/:keyword', './search/index');
    router.get('/ttjj/user/:uid', './ttjj/user');
};
