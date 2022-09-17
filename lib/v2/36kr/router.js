module.exports = (router) => {
    router.get(/([\w-/]+)?/, require('./index'));
};
