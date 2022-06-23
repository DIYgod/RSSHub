module.exports = (router) => {
    router.get('/:lang?', require('./index'));
};
