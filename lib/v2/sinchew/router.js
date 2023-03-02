module.exports = function (router) {
    router.get(/([\w/-]+)?/, require('./index'));
    router.get('', require('./index'));
};
