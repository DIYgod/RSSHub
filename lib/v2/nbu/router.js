module.exports = function (router) {
    router.get('/graduate/:type', require('./graduate'));
};
