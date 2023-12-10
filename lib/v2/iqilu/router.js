module.exports = (router) => {
    router.get('/v/:category*', require('./program'));
};
