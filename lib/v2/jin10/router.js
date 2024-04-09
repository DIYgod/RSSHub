module.exports = function (router) {
    router.get('/:important?', require('./index'));
    router.get('/topic/:id', require('./topic'));
};
