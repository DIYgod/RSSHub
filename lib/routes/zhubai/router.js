export default (router) => {
    router.get('/top20', './top20');
    router.get('/:id', './index');
};
