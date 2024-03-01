export default (router) => {
    router.get('/changelog', './changelog');
    router.get('/changelog/dev', './changelog-dev');
};
