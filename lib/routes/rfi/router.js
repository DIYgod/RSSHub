module.exports = function (router) {
    router.get('/:path*', './news');
};
