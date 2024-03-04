export default (router) => {
    router.get('/blog/:category*', './blog');
};
