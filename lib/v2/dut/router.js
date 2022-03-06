module.exports = function (router) {
    router.get(/([\w\d]+)\/([\w\d/]+)?/, require('./index'));
    router.get('/:0?', require('./index'));
};
