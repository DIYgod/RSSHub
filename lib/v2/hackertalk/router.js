module.exports = function (router) {
    router.get('/:limit?', require('./index'));
};
