module.exports = function (router) {
    router.get('/renjian/:category?', require('./renjian'));
    router.get('/today/:need_content?', require('./today'));
    router.get('/news/rank/:category?/:type?/:time?', require('./rank'));
};
