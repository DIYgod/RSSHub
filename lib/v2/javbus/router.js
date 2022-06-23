module.exports = (router) => {
    router.get(/([\w\d/-]+)?/, require('./index'));
};
