module.exports = function (router) {
    router.get('/:language/:section', require('./index'));
};
