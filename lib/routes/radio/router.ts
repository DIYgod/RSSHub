export default (router) => {
    router.get('/album/:id', './album');
    router.get('/zhibo/:id', './zhibo');
    router.get('/:id', './index');
};
