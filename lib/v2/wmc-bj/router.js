module.exports = (router) => {
    router.get('/publish/:category*', require('./publish'));
};
