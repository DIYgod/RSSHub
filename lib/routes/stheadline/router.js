export default (router) => {
    router.get('/std/realtime/', './std/realtime');
    router.get('/std/realtime/:category{.+}', './std/realtime');
};
