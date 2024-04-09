module.exports = (router) => {
    router.get('/:column?', require('./index'));
};
