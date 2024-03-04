export default (router) => {
    router.get('/list/:id', './list');
    router.get('/:category*', './lists');
};
