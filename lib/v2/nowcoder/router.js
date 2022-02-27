module.exports = function (router) {
    router.get('/discuss/:type/:order', require('./discuss'));
    router.get('/experience/:tagId', require('./experience'));
    router.get('/jobcenter/:recruitType?/:city?/:type?/:order?/:latest?', require('./jobcenter'));
    router.get('/recommend', require('./recommend'));
    router.get('/schedule/:propertyId?/:typeId?', require('./schedule'));
};
