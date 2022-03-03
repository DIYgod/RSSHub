module.exports = function (router) {
    router.get('/beijing/kw/:channel', require('./beijing/kw/index'));
    router.get('/shenzhen/hrss/szksy/:caty/:page?', require('./shenzhen/hrss/szksy/index'));
    router.get('/shenzhen/zzb/:caty/:page?', require('./shenzhen/zzb/index'));
    router.get('/shanghai/rsj/ksxm', require('./shanghai/rsj/ksxm'));
    router.get('/shanghai/wsjkw/yqtb', require('./shanghai/wsjkw/yqtb'));
    router.get('/guangdong/tqyb/tfxtq', require('./guangdong/tqyb/tfxtq'));
    router.get('/guangdong/tqyb/sncsyjxh', require('./guangdong/tqyb/sncsyjxh'));
    router.get('/huizhou/zwgk/:category?', require('./huizhou/zwgk/index'));
    router.get('/sichuan/deyang/govpulicinfo/:countyName/:institutionName?', require('./sichuan/deyang/govpulicinfo'));
};
