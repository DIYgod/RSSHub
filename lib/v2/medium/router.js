module.exports = (router) => {
    router.get('/following/:user', require('./following'));
    router.get('/for-you/:user', require('./for-you'));
    router.get('/list/:user/:catalogId', require('./list'));
    router.get('/tag/:user/:tag', require('./tag'));
};
