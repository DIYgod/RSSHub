module.exports = function (router) {
    router.get('/yjsy_all', require('./yjsy/all.js'));
    router.get('/yjsy/:type', require('./yjsy/index'));
};
