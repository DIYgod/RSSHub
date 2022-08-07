module.exports = function (router) {
    router.get('/cdrh', require('./cdrh'));
    router.get('/cdrh-title', require('./cdrh-title'));
};
