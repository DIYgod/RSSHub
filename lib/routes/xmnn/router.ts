export default (router) => {
    router.get('/epaper/:id?', './epaper');
    router.get('/news/', './news');
    router.get('/news/:category{.+}', './news');
};
