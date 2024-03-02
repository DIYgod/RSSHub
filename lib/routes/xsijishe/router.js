export default (router) => {
    router.get('/forum/:fid', './forum');
    router.get('/rank/:type', './rank');
};
