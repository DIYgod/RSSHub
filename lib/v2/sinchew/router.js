module.exports = function (router) {
    router.get(/([\w/-]+)?/, './index');
    router.get('', './index');
};
