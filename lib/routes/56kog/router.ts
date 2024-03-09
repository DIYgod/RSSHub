export default (router) => {
    router.get('/class/:category?', './class');
    router.get('/top/:category?', './top');
};
