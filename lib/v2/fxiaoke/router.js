module.exports = function (router) {
    router.get('/crm/:type', require('./crm'));
};
