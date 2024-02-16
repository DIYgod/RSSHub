module.exports = function (router) {
    router.get('/51cto/:category', require('./51cto'));
    router.get('/zhujiceping', require('./zhujiceping'));
    router.get('/bulianglincom', require('./bulianglincom'));
    router.get('/diannaowanwu', require('./diannaowanwu'));
    router.get('/freecomtw', require('./freecomtw'));
    router.get('/hicairocom', require('./hicairocom'));
    router.get('/howtoforge', require('./howtoforge'));
    router.get('/iweeccom', require('./iweeccom'));
    router.get('/lalaim', require('./lalaim'));
    router.get('/pcrookie', require('./pcrookie'));
    router.get('/ruanjianyingyong', require('./ruanjianyingyong'));
    router.get('/ygkkk', require('./ygkkk'));
    router.get('/walixzcom', require('./walixzcom'));
    router.get('/pianyivps', require('./pianyivps'));
    router.get('/dongvpscom', require('./dongvpscom'));
    router.get('/freeadaycom', require('./freeadaycom'));
    router.get('/ippatop', require('./ippatop'));
};
