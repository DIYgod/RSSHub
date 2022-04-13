module.exports = function (router) {
    router.get('/scientific', require('./scientific'));
    router.get('/:channel', require('./calendar'));
};
