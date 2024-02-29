module.exports = function (router) {
    router.get('/scientific', './scientific');
    router.get('/:channel', './channel');
};
