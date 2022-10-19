module.exports = (router) => {
    router.get('/company', require('./supported_company'));
    router.get('/track/:number/:id/:phone?', require('./index'));
};
