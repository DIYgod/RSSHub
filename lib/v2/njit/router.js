module.exports = (router) => {
    router.get('/tzgg', require('./tzgg'));
    router.get('/jwc/:type?', require('./jwc'));
};
