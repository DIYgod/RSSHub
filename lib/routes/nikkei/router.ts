export default (router) => {
    router.get('/', './index');
    router.get('/asia', './asia/index');
    router.get('/cn/*', './cn/index');
    router.get('/index', './index');
    router.get('/:category/:article_type?', './news');
};
