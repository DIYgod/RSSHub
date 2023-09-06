module.exports = (router) => {
    router.get('/:site?/:channel?', require('./index'));
};
