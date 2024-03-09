export default (router) => {
    router.get('/user/:id', './timeline');
    router.get('/user/:id/cast', './cast');
    router.get('/user/:id/livestream', './livestream');
};
