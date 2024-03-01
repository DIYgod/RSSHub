module.exports = (router) => {
    router.get('/company', require('./supported-company'));
    router.get('/track/:number/:id/:phone?', require('./index'));
};
