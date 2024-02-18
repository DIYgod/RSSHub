module.exports = (router) => {
    router.get('/column/:columnId', require('./column'));
    router.get('/gamedb/recent', require('./gamedb'));
    router.get('/usergames', require('./usergames'));
    router.get('/:type', require('./article'));
};
