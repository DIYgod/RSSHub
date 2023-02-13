module.exports = function (router) {
    router.get('/exclusive/:id?', require('./exclusive'));
    router.get('/ds/:id', require('./ds'));
    router.get('/dy/:id', require('./dy'));
    router.get('/dy2/:id', require('./dy2'));
    router.get('/news/rank/:category?/:type?/:time?', require('./news/rank'));
    router.get('/news/special/:type?', require('./news/special'));
    router.get('/open/vip', require('./open/vip'));
    router.get('/renjian/:category?', require('./renjian'));
    router.get('/today/:need_content?', require('./today'));
};
