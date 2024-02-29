module.exports = (router) => {
    router.get('/news/:path*', './news');
};
