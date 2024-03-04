export default (router) => {
    router.get('/v/:category*', './program');
};
