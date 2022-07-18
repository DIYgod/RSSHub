module.exports = function (router) {
    router.get('/ggtz', require('./ggtz'));
    router.get('/jwc', require('./jwc'));
    router.get('/zsjyc', require('./zsjyc'));
};
