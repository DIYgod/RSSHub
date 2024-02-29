module.exports = function (router) {
    router.get('/myft/:key', './myft');
    router.get('/:language/:channel?', './channel');
};
