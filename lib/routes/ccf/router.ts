export default (router) => {
    router.get('/ccfcv/:channel/:category', './ccfcv/index');
    router.get('/news/:category?', './news');
    router.get('/tfbd/:caty/:id', './tfbd/index');
};
