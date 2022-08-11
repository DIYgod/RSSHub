module.exports = function (router) {
    router.get('/:category/:fulltext?', require('./index'));
};
