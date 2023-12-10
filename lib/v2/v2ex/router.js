module.exports = (router) => {
    router.get('/post/:postid', require('./post'));
    router.get('/tab/:tabid', require('./tab'));
    router.get('/topics/:type', require('./topics'));
};
