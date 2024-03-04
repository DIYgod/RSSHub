export default (router) => {
    router.get('/publish/:category*', './publish');
};
