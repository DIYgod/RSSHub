module.exports = function (router) {
    router.get('/research/:categoryGuid?', require('./research'));
};
