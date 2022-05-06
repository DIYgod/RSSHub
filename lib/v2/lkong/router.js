module.exports = function (router) {
    router.get('/forum/:id?/:digest?', require('./forum'));
    router.get('/thread/:id', require('./thread'));
};
