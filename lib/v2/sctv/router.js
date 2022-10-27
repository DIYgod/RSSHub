module.exports = function (router) {
    router.get('/programme/:id?', require('./programme'));
};
