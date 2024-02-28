module.exports = function (router) {
    router.get('/blogs/:tag', './blogs');
    router.get('/channel/:name', './channel');
    router.get('/user/:name', './user');
};
