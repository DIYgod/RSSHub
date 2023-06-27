module.exports = function (router) {
    router.get('/jwc/:type?', require('./jwc'));
    router.get('/yxy/:type?', require('./yxy'));
    router.get('/yjsgl/:type', require('./yjsgl'));
};
