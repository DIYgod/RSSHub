export default (router) => {
    router.get('/:path*', './news');
};
