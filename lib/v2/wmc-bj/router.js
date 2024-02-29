module.exports = (router) => {
    router.get('/publish/:category*', './publish');
};
