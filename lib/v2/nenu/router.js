module.exports = function (router) {
    router.get(/\/sohac([\w-/]+)?/, require('./sohac'));
    router.get(/\/yjsy([\w-/]+)?/, require('./yjsy'));
};
