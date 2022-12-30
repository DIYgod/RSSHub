module.exports = (router) => {
    router.get('/:id/:lang?', require('./index'));
};
