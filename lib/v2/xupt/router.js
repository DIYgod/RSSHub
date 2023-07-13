module.exports = function (router) {
    router.get('/gr/:type', require('./gr'));
};
