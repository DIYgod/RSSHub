module.exports = (router) => {
    router.get('/daily', require('./article'));
    router.get('/:id?', require('./index'));
};
