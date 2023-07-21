module.exports = function (router) {
    router.get('/:bcid?/:cid?', require('./index'));
};
