module.exports = function (router) {
    router.get(/(\w+)\/([\w/]+)?/, require('./index'));
    router.get('/:0?', require('./index'));
};
