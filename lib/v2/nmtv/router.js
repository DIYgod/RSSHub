module.exports = function (router) {
    router.get('/column/:id?', require('./column'));
};
