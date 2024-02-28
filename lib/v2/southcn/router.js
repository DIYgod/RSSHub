module.exports = (router) => {
    router.get('/nfapp/column/:column?', './nfapp/column');
    router.get('/nfapp/reporter/:reporter', './nfapp/reporter');
};
