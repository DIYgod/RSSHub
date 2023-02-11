module.exports = function (router) {
    router.get('/query/:query?', require('./list'));
};
