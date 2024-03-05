export default (router) => {
    router.get('/forum/:id/:type?', './forum');
};
