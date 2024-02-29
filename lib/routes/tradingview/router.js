module.exports = function (router) {
    router.get('/blog/:category*', './blog');
    router.get('/desktop', './desktop');
    router.get('/pine/:version?', './pine');
};
