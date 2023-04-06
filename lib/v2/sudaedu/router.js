module.exports = (router) => {
    router.get('/yjs/:type', require('./yjs/index'));
};
