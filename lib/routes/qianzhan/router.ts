export default (router) => {
    router.get('/analyst/column/:type?', './column');
    router.get('/analyst/rank/:type?', './rank');
};
