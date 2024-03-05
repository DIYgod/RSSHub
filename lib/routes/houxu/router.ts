export default (router) => {
    router.get('/events', './events');
    router.get('/featured', './index');
    router.get('/index', './index');
    router.get('/lives/:id', './lives');
    router.get('/memory', './memory');
    router.get('/', './index');
};
