module.exports = (router) => {
    router.get('/author/:uid/:lang?', require('./author'));
    router.get('/:lang?', require('./index'));
};
