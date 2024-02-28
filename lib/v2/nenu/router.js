module.exports = function (router) {
    router.get(/\/sohac([\w-/]+)?/, './sohac');
    router.get(/\/yjsy([\w-/]+)?/, './yjsy');
};
