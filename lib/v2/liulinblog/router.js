module.exports = function (router) {
    router.get('/kuaixun', require('./kuaixun'));
    router.get('/itnews/:channel?', require('./itnews'));
};
