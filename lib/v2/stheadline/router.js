module.exports = (router) => {
    router.get('/std/realtime/:category*', require('./std/realtime'));
};
