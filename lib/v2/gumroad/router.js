module.exports = function (router) {
    router.get('/:username/:products', require('./index'));
};
