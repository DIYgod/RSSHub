module.exports = function (router) {
    router.get('/user/video/:uid/:disableEmbed?', './user-video');
};
