module.exports = function (router) {
    router.get('/live/:id', require('./live'));
};
