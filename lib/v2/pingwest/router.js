module.exports = (router) => {
    router.get('/status', require('./status'));
    router.get('/tag/:tag/:type/:option?', require('./tag'));
    router.get('/user/:uid/:type?/:option?', require('./user'));
};
