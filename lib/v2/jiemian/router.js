module.exports = function (router) {
    router.get('/list/:id?', require('./list'));
    router.get('/', require('./list'));
};
