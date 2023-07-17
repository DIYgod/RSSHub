module.exports = function (router) {
    router.get('/ncmte/:type', require('./ncmte'));
};
