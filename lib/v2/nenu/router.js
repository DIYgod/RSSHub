module.exports = function (router) {
    router.get(/\/yjsy([\w-/]+)?/, require('./yjsy'));
};
