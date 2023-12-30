module.exports = function (router) {
    router.get('/latest-stories', require('./latest-stories'));
};
