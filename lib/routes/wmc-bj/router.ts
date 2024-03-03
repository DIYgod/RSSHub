export default (router) => {
    router.get('/publish/', './publish');
    router.get('/publish/:category{.+}', './publish');
};
