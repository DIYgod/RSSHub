module.exports = (router) => {
    router.get('/:type/:id?', require('./index'));
};
