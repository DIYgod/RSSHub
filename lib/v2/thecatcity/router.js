module.exports = (router) => {
    router.get('/:term?', require('./index'));
};
