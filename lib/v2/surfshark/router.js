module.exports = (router) => {
    router.get('/blog/:category*', './blog');
};
