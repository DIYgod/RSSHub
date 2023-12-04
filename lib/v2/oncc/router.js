module.exports = function (router) {
    router.get('/money18/:id?', require('./money18'));
    router.get('/:language/:channel?', require('./index'));
};
