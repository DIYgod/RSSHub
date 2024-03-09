export default (router) => {
    router.get('/:important?', './index');
    router.get('/topic/:id', './topic');
};
