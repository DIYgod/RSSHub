module.exports = (router) => {
    router.get('/:site?/:channel?', './index');
};
