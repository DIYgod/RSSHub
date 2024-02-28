module.exports = function (router) {
    router.get(/(\w+)\/([\w/]+)?/, './index');
    router.get('/:0?', './index');
};
