module.exports = function (router) {
    router.get('/rent/:query?', require('./list'));
};
