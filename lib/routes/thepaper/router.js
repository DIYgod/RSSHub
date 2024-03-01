export default (router) => {
    router.get('/839studio', './839studio/studio');
    router.get('/839studio/:id', './839studio/category');
    router.get('/channel/:id', './channel');
    router.get('/list/:id', './list');
    router.get('/featured', './featured');
    router.get('/factpaper/:status?', './factpaper');
    router.get('/sidebar/:sec?', './sidebar');
};
