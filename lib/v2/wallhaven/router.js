module.exports = function (router) {
    router.get('/:filter?/:needDetails?', require('./index'));
};
