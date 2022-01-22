module.exports = function (router) {
    router.get('/beijing/kw/:channel', require('./beijing/kw/index'));
    router.get('/shenzhen/hrss/szksy/:caty/:page?', require('./shenzhen/hrss/szksy/index'));
    router.get('/shenzhen/zzb/:caty/:page?', require('./shenzhen/zzb/index'));
    router.get('/shanghai/rsj/ksxm', require('./shanghai/rsj/ksxm'));
    router.get('/guangdong/tqyb/tfxtq', require('./guangdong/tqyb/tfxtq'));
    router.get('/guangdong/tqyb/sncsyjxh', require('./guangdong/tqyb/sncsyjxh'));
};
