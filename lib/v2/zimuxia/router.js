module.exports = (router) => {
    router.get('/portfolio/:id', require('./portfolio'));
    router.get('/:category?', require('./index'));
};
