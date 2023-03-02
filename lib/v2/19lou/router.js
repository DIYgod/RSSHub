module.exports = function (router) {
    router.get('/:city?', require('./index'));
};
