module.exports = function (router) {
    router.get(/([\w-/]+)?/, require('./'));
};
