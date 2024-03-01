module.exports = function (router) {
    router.get('/:label?', require('./index'));
};
