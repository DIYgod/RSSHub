module.exports = function (router) {
    router.get('/:language/:channel?', require('./index'));
};
