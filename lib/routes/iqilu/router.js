module.exports = (router) => {
    router.get('/v/:category*', './program');
};
