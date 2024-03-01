export default (router) => {
    router.get('/author/:id?', './author');
    router.get('/brief', './brief');
    router.get('/dt/:column?/:category?', './dt');
    router.get('/feed/:id?', './feed');
    router.get('/headline', './headline');
    router.get('/latest', './latest');
    router.get('/news/:id?', './news');
    router.get('/video/:id?', './video');
    router.get('/vip/:id?', './vip');
};
