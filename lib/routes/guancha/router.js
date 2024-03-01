export default (router) => {
    router.get('/headline', './headline');
    router.get('/member/:category?', './member');
    router.get('/personalpage/:uid', './personalpage');
    router.get('/topic/:id/:order?', './topic');
    router.get('/:category?', './index');
};
