module.exports = function (router) {
    router.get('/cdrh/:titleOnly?', require('./cdrh'));
};
