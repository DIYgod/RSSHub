module.exports = (router) => {
    router.get('/nfapp/column/:column?', require('./nfapp/column'));
    router.get('/nfapp/reporter/:reporter', require('./nfapp/reporter'));
};
