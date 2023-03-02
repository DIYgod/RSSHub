module.exports = function (router) {
    router.get(/([\w\d/-]+)?/, require('./index'));
};
