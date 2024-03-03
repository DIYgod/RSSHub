export default (router) => {
    router.get('/epaper/:id?', './epaper');
    router.get('/news/:category*', './news');
};
