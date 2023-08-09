module.exports = (router) => {
    router.get('/:topic?', require('./topic'));
};
