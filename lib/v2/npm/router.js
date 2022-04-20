module.exports = function (router) {
    router.get(/package[\w\d/-]+/, require('./package'));
};
