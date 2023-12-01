module.exports = (router) => {
    router.get('/sme/:path*', require('./sme'));
};
