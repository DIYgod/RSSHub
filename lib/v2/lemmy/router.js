module.exports = function (router) {
    router.get('/:community/:sort?', require('./index'));
};
