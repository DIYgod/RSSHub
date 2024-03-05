export default (router) => {
    router.get('/news/:category?/:language?', './news');
};
