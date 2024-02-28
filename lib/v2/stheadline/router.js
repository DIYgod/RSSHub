module.exports = (router) => {
    router.get('/std/realtime/:category*', './std/realtime');
};
