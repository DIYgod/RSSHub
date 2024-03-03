export default (router) => {
    router.get('/authors/:id/:slug/:source?', './authors');
    router.get('/:site', './index');
    router.get('/', './index');
};
