module.exports = function (router) {
    router.get('/cs', require('./cs/cs'));
    router.get('/jwc', require('./jwc/jwc'));
    router.get('/rszhaopin', require('./rszhaopin'));
    router.get('/yjs', require('./yjs'));
};
