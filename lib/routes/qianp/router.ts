export default (router) => {
    router.get('/news/:path*', './news');
};
