module.exports = function (router) {
    router.get('/shenzhen/hrss/szksy/:caty/:page?', require('./shenzhen/hrss/szksy/index'));
    router.get('/shenzhen/zzb/:caty/:page?', require('./shenzhen/zzb/index'));
};
