module.exports = function (router) {
    router.get('/jwc/:type?', require('./jwc'));
    router.get('/yxy/:type?', require('./yxy'));
};
