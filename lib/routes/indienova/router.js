export default (router) => {
    router.get('/column/:columnId', './column');
    router.get('/gamedb/recent', './gamedb');
    router.get('/usergames', './usergames');
    router.get('/:type', './article');
};
