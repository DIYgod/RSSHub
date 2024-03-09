export default (router) => {
    router.get('/boards', './boards');
    router.get('/:board?', './index');
};
