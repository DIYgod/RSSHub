module.exports = function (router) {
    router.get('/beijing/kw/:channel', require('./beijing/kw/index'));
};
