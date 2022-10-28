module.exports = function (router) {
    router.get('/bulletin/:category?', require('./bulletin'));
    router.get('/cas/:category?', require('./cas'));
    router.get('/jwc/:category?', require('./jwc'));
    router.get('/lib', require('./library/lib'));
    router.get('/scs/:category?', require('./scs'));
    router.get('/sese/:category?', require('./sese'));
    router.get('/xgc', require('./xgc'));
    router.get(/yjs\/([\w/-]+)?/, require('./yjs'));
};
