module.exports = (router) => {
    router.get('/news/:type', require('./news/index'));
    router.get('/sme/:path*', require('./sme'));
};
