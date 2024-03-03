export default (router) => {
    router.get('/lm/:id?', './lm');
    router.get('/photo/jx', './jx');
    router.get('/xwlb', './xwlb');
    router.get('/:category', './category');
};
