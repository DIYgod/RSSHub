module.exports = function (router) {
    router.get('/shanghai/rsj/ksxm', require('./shanghai/rsj/ksxm'));
    router.get('/guangdong/tqyb/tfxtq', require('./guangdong/tqyb/tfxtq'));
    router.get('/guangdong/tqyb/sncsyjxh', require('./guangdong/tqyb/sncsyjxh'));
};
