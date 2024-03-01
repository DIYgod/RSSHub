export default (router) => {
    router.get('/cid/:id?', './cid');
    router.get('/rank/:range?', './rank');
    router.get('/zhibo', './cid');
    router.get('/:category*', './');
};
