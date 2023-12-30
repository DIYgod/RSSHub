module.exports = function (router) {
    router.get('/:column', require('./column'));
};
