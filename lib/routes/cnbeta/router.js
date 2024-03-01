export default (router) => {
    router.get('/:type/:id', './type');
    router.get('/', './type');
};
