module.exports = function (router) {
    router.get('/ft/myft/:key', require('./myft'));
    router.get('/ft/:language/:channel?', require('./channel'));
};
