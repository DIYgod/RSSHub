export default (router) => {
    router.get('/reports', './reports');
    router.get('/:cate?', './index');
};
