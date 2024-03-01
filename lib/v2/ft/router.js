module.exports = function (router) {
    router.get('/myft/:key', require('./myft'));
    router.get('/:language/:channel?', require('./channel'));
};
