module.exports = (router) => {
    router.get('/:site/:grouping/:name', require('./index'));
};
