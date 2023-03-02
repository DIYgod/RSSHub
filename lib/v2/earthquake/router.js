module.exports = (router) => {
    router.get('/ceic/:type?', require('./ceic'));
    router.get('/:region?', require('./index'));
};
