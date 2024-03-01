export default (router) => {
    router.get('/job/bigemploy', './job/bigemploy');
    router.get('/job/calendar', './job/calendar');
    router.get('/job/list/:id', './job/list');
    router.get('/gx/card/:column/:id?', './gx/card');
    router.get('/gx/list/:column/:id?', './gx/list');
    router.get('/uae/:id', './uae/news');
    router.get('/ugs/news/:author?/:category?', './ugs/news');
    router.get('/yjsy/list/:id', './yjsy/list');
};
