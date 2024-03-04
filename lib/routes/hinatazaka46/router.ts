export default (router) => {
    router.get('/news', './news');
    router.get('/blog/:id?/:page?', './blog');
};
