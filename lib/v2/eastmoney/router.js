module.exports = (router) => {
    router.get('/report/:category', require('./report/index'));
    router.get('/search/:keyword', require('./search/index'));
    router.get('/ttjj/user/:uid', require('./ttjj/user'));
};
