export default (router) => {
    router.get('/tag/:id?', './tag');
    router.get('/date/:date?', './date');
    router.get('/:category?', './index');
};
