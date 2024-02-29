module.exports = function (router) {
    router.get(/package[\w/-]+/, require('./package'));
};
