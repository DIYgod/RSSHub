export default (router) => {
    router.get('/tzgg', './tzgg');
    router.get('/jwc/:type?', './jwc');
};
