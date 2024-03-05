export default (router) => {
    router.get('/express-news', './express-news');
    router.get('/news', './news');
    router.get('/', './news');
};
