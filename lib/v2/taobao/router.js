module.exports = function (router) {
    router.get('/zhongchou/:type?', require('./zhongchou'));
};
