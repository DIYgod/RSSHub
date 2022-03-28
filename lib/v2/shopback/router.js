module.exports = function (router) {
    router.get('/:store', require('./store'));
};
