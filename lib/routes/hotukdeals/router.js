export default (router) => {
    router.get('/hottest', './hottest');
    router.get('/:type', './index');
};
