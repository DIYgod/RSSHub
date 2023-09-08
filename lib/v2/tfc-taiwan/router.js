module.exports = (router) => {
    router.get('/', require('./index'));
    router.get('/category/:id+', require('./index'));
    router.get('/info', require('./index'));
    router.get('/report', require('./index'));
    router.get('/topic/:id', require('./index'));
};
