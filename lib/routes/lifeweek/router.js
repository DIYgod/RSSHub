module.exports = function (router) {
    router.get('/channel/:id', './channel');
    router.get('/tag/:id', './tag');
};
