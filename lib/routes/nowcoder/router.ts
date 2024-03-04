export default (router) => {
    router.get('/discuss/:type/:order', './discuss');
    router.get('/experience/:tagId', './experience');
    router.get('/jobcenter/:recruitType?/:city?/:type?/:order?/:latest?', './jobcenter');
    router.get('/recommend', './recommend');
    router.get('/schedule/:propertyId?/:typeId?', './schedule');
};
