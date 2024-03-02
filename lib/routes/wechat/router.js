export default (router) => {
    router.get('/announce', './announce');
    router.get('/ce/:id', './ce');
    router.get('/data258/:id?', './data258');
    router.get('/ershicimi/:id', './ershcimi');
    // router.get('/feeddd/:id', './feeddd'); // TODO: remove this
    // router.get('/feeds/:id', './feeds'); // TODO: remove this
    router.get('/mp/homepage/:biz/:hid/:cid?', './mp');
    router.get('/mp/msgalbum/:biz/:aid', './msgalbum');
    router.get('/sogou/:id', './sogou');
    router.get('/tgchannel/:id/:mpName?/:searchQueryType?', './tgchannel');
    router.get('/uread/:userid', './uread');
    router.get('/wechat2rss/:id', './wechat2rss');
    // router.get('/wxnmh/:id', './wxnmh'); // TODO: remove this
};
