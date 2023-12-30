module.exports = function (router) {
    router.get('/:channel?', require('./index'));
};
