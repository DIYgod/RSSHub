export default (router) => {
    router.get('/status', './status');
    router.get('/tag/:tag/:type/:option?', './tag');
    router.get('/user/:uid/:type?/:option?', './user');
};
