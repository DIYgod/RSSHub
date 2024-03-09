export default (router) => {
    router.get('/work/tags/:tag', './index');
    router.get('/tag/:tag', './index');
    router.get('*', './index');
};
