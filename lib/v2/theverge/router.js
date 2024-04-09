module.exports = (router) => {
    router.get('/:hub?', require('./index'));
};
