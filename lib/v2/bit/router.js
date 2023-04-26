module.exports = function (router) {
    router.get('/rszhaopin', require('./rszhaopin'));
    router.get('/grd/:type', require('./grd'));
};
