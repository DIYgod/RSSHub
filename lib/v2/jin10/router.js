module.exports = function (router) {
    router.get('/:important?', require('./index'));
};
