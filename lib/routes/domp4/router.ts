export default (router) => {
    router.get('/detail/:id', './detail');
    router.get('/latest/:type?', './latest');
};
