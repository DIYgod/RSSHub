module.exports = function (router) {
    router.get('/album/:id', require('./album'));
    router.get('/zhibo/:id', require('./zhibo'));
    router.get('/:id', require('./index'));
};
