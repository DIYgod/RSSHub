export default (router) => {
    router.get('/', './index');
    router.get('/featured', './featured');
    router.get('/series/:series', './series');
    router.get('/topic/:topic', './topic');
};
