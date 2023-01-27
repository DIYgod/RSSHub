module.exports = function (router) {
    router.get('/:username/:type?', require('./index'));
};
