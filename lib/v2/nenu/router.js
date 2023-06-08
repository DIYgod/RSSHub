module.exports = function (router) {
    router.get(/\/sohac([\w-/]+)?/, require('./sohac'));
};
