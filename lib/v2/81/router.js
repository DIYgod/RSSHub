module.exports = function (router) {
    router.get(/81rc(\/[\w-/]+)?/, require('./81rc'));
};
