export default (router) => {
    router.get('/blog/', './blog');
    router.get('/blog/:category{.+}', './blog');
    router.get('/desktop', './desktop');
    router.get('/pine/:version?', './pine');
};
