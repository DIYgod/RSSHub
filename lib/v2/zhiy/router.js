module.exports = (router) => {
    router.get('/letters/:author', require('./letter'));
    router.get('/posts/:author', require('./post'));
};
