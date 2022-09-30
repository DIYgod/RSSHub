module.exports = (router) => {
    router.get('/channel/:channel/board/:board', require('./index'));
};
