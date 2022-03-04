module.exports = function (router) {
    router.get('/:date/:from/:to/:type?', require('./index'));
    router.get('/zxdt/:id?', require('./zxdt'));
};
