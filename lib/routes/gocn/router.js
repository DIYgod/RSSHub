export default (router) => {
    router.get('/', './news');
    router.get('/jobs', './jobs');
    router.get('/news', './news');
    router.get('/topics', './topics');
};
