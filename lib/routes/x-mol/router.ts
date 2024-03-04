export default (router) => {
    router.get('/news/:tag?', './news');
    router.get('/paper/:type/:magazine', './paper');
};
