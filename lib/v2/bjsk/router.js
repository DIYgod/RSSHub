module.exports = (router) => {
    router.get('/keti/:id?', require('./keti'));
    router.get('/:path?', require('./index'));
};
