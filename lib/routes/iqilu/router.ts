export default (router) => {
    router.get('/v/', './program');
    router.get('/v/:category{.+}', './program');
};
