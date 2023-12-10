module.exports = function (router) {
    router.get(/dongke([\w-/]+)?/, require('./dongke'));
};
