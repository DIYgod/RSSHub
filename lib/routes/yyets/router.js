export default (router) => {
    router.get('/article/:type?', './article');
    router.get('/today', './today');
};
