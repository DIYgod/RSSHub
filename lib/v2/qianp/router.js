module.exports = (router) => {
    router.get('/news/:path*', require('./news'));
};
