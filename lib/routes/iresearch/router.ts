export default (router) => {
    router.get('/report', './report');
    router.get('/weekly/:category?', './weekly');
};
