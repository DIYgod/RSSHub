module.exports = function (router) {
    router.get('/self-study', require('./self-study'));
    router.get('/:id?', require('./index'));
};
