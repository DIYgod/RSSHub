export default (router) => {
    router.get('/keti/:id?', './keti');
    router.get('/:path?', './index');
};
