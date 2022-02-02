module.exports = function (router) {
    router.get('/:sid?/:tid?', require('./index'));
};
