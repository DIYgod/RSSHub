module.exports = (router) => {
    router.get('/:kind?', require('./index'));
};
