module.exports = (router) => {
    router.get('/list/:user/:catalogId', require('./list'));
    router.get('/for-you/:user', require('./for-you'));
    router.get('/following/:user', require('./following'));
    router.get('/tag/:user/:tag', require('./tag'));
};
