export default (router) => {
    router.get('/news/:option?', './news');
    router.get('/topics/:abbr/:category?/:option?', './topics');
    router.get('/schedules/:serie?/:category?', './schedules');
};
