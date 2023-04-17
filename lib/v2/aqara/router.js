module.exports = function (router) {
    router.get('/community/:id?/:keyword?', require('./community'));
};
