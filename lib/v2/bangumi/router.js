module.exports = function (router) {
    router.get('/online', require('./online'));
    router.get(/([\w-/]+)?/, require('./index'));
};
