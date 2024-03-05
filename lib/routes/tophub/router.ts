export default (router) => {
    router.get('/:id', './');
    router.get('/list/:id', './list');
};
