module.exports = function (router) {
    router.get('/user/video/:uid/:disableEmbed?', require('./user-video'));
};
