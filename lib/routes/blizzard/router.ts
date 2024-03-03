export default (router) => {
    router.get('/news/:language?/:category?', './news');
};
