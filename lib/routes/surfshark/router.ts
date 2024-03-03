export default (router) => {
    router.get('/blog/', './blog');
    router.get('/blog/:category{.+}', './blog');
};
