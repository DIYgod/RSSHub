module.exports = function (router) {
    router.get('/announce', require('./announce'));
    router.get('/ce/:id', require('./ce'));
    router.get('/data258/:id?', require('./data258'));
    router.get('/ershicimi/:id', require('./ershcimi'));
    // router.get('/feeddd/:id', require('./feeddd')); // TODO: remove this
    // router.get('/feeds/:id', require('./feeds')); // TODO: remove this
    router.get('/mp/homepage/:biz/:hid/:cid?', require('./mp'));
    router.get('/mp/msgalbum/:biz/:aid', require('./msgalbum'));
    router.get('/sogou/:id', require('./sogou'));
    router.get('/tgchannel/:id/:mpName?/:searchQueryType?', require('./tgchannel'));
    router.get('/uread/:userid', require('./uread'));
    router.get('/wechat2rss/:id', require('./wechat2rss'));
    // router.get('/wxnmh/:id', require('./wxnmh')); // TODO: remove this
};
