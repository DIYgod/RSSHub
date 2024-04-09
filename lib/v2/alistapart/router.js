module.exports = (router) => {
    router.get('/', require('./index'));
    router.get('/:topic', require('./topic'));
};
