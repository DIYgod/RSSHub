module.exports = (router) => {
    router.get('/:channel', require('./channel'));
};
