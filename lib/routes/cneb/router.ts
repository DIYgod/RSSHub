export default (router) => {
    router.get('/yjxw/:category?', './yjxw');
    router.get('/yjxx/*', './yjxx');
};
