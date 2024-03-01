export default (router) => {
    router.get('/user/video/:uid/:disableEmbed?', './user-video');
};
