export default (router) => {
    router.get('/news/:category?/:id?', './news');
};
