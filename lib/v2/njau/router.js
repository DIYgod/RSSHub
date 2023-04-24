module.exports = function (router) {
    router.get('/grasch/:type', require('./grasch'));
};
