module.exports = (router) => {
    router.get('/ttjj/user/:uid', require('./ttjj/user'));
    router.get('/search/:keyword', require('./search/index'));
    router.get('/report/:category', require('./report/index'));
};
